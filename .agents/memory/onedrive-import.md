---
name: OneDrive archive imports
description: Reliable large-file downloads through the connected Microsoft Graph proxy.
---
Fetch full drive-item metadata rather than selecting only the download URL: the shares endpoint can omit its download URL when a `$select` is used. Stream large ZIP downloads directly to disk.

**Why:** The connector does not follow `/content` redirects, and the supplied project archive exceeds 1 GB. Full metadata supplies the temporary download URL without loading the archive into memory.

**How to apply:** Resolve the shared item, fetch its metadata without `$select`, and use the returned URL inside the same impure call without logging or persisting that URL. Exclude uploaded `.env` files and bundled dependencies from source imports.
