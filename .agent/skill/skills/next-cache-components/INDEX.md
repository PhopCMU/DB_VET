# Next Cache Components Skills — INDEX

## จุดประสงค์

ชุด skill สำหรับตัดสินใจเรื่อง caching strategy ใน Next.js 15 App Router  
อิงตาม `next.config.ts` ที่ตั้งค่า `Cache-Control` และ `minimumCacheTTL` ไว้แล้ว

## หมายเหตุ Stack นี้

```
next.config.ts:
  reactStrictMode: false
  images.minimumCacheTTL: 60
  headers: Cache-Control: no-store, no-cache (ทุก path)
```

แนวทาง caching ของ repo นี้: **no-store by default** สำหรับ page responses

## Skills ในหมวดนี้

| ไฟล์ | ใช้เมื่อ |
|---|---|
| [cache-decision-tree.md](./cache-decision-tree.md) | ตัดสินใจว่าควรแคชอะไรและไม่แคชอะไร |
| [fetch-caching-revalidate-patterns.md](./fetch-caching-revalidate-patterns.md) | กำหนด revalidation สำหรับ fetch calls |
| [client-vs-server-state-boundary.md](./client-vs-server-state-boundary.md) | แยก state ระหว่าง server และ client |

## Skills ที่เกี่ยวข้อง

- [next-best-practices/data-fetching-and-rsc-boundaries.md](../next-best-practices/data-fetching-and-rsc-boundaries.md)
- [react-best-practices/state-management-guidelines.md](../react-best-practices/state-management-guidelines.md)
