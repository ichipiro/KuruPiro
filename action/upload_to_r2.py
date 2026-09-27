from __future__ import annotations

import hashlib
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import boto3
from botocore.config import Config

_CACHE_CONTROL = "public, max-age=3600"
MAX_WORKERS = 20


def _make_client() -> boto3.client:
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT_URL"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
        ),
        region_name="auto",
    )


def _file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _get_remote_manifest(client: boto3.client, bucket_name: str) -> dict[str, str]:
    try:
        resp = client.get_object(Bucket=bucket_name, Key="manifest.json")
        return json.loads(resp["Body"].read())
    except Exception:  # noqa: BLE001
        return {}


def _upload_one(
    client: boto3.client, bucket_name: str, local_path: Path, r2_key: str
) -> None:
    client.put_object(
        Bucket=bucket_name,
        Key=r2_key,
        Body=local_path.read_bytes(),
        ContentType="application/json",
        CacheControl=_CACHE_CONTROL,
    )


def upload_to_r2(output_dir: Path, bucket_name: str) -> int:
    client = _make_client()

    all_files = [
        (path, path.relative_to(output_dir).as_posix())
        for path in output_dir.rglob("*.json")
    ]
    if not all_files:
        print("No JSON files found.", file=sys.stderr)
        return 0

    manifest_local = output_dir / "manifest.json"
    timetable_files = [(lp, key) for lp, key in all_files if lp != manifest_local]

    remote_manifest = _get_remote_manifest(client, bucket_name)
    to_upload = [
        (lp, key)
        for lp, key in timetable_files
        if _file_hash(lp) != remote_manifest.get(key)
    ]
    skipped = len(timetable_files) - len(to_upload)
    print(f"  {len(to_upload)} files to upload, {skipped} unchanged (skipped)")

    done = 0
    failed: list[tuple[str, str]] = []

    if to_upload:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {
                pool.submit(_upload_one, client, bucket_name, lp, key): key
                for lp, key in to_upload
            }
            for future in as_completed(futures):
                key = futures[future]
                try:
                    future.result()
                    done += 1
                    if done % 50 == 0:
                        print(f"  {done}/{len(to_upload)}...")
                except Exception as e:  # noqa: BLE001
                    failed.append((key, str(e)))

    if failed:
        print(f"\nFailed ({len(failed)}):")
        for key, msg in failed[:5]:
            print(f"  {key}: {msg[:120]}")
        sys.exit(1)

    if manifest_local.exists():
        _upload_one(client, bucket_name, manifest_local, "manifest.json")
        print("  manifest.json uploaded")

    print(f"Done. {done} files uploaded to {bucket_name}")
    return done


def main() -> None:
    output_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("tmp/output")
    bucket_name = os.environ.get("R2_BUCKET_NAME", "kurpiro-timetable")

    if not output_dir.exists():
        print(f"Error: output directory not found: {output_dir}", file=sys.stderr)
        sys.exit(1)

    upload_to_r2(output_dir, bucket_name)


if __name__ == "__main__":
    main()
