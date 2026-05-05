# Rollback Plan and Verification

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อ upgrade ล้มเหลวหรือพบปัญหาใน production  
หรือใช้เป็น reference plan ก่อนเริ่ม upgrade ทุกครั้ง

## 2. Preconditions

- Git repository มี branch ก่อน upgrade (หรือ tag)
- PM2 ใช้สำหรับ deploy (`ecosystem.config.js`) — port 4040
- `npm run build` ต้องผ่านก่อน deploy

## 3. Inputs

- `ROLLBACK_POINT` — git tag หรือ branch ก่อน upgrade
- `DEPLOYMENT_SERVER` — server ที่ต้อง rollback

## 4. Outputs

- Application กลับมาทำงานด้วย version ก่อน upgrade

## 5. ขั้นตอน

### ขั้นที่ 1 — สร้าง Rollback Point ก่อน Upgrade

```bash
# บันทึก tag ก่อน upgrade — ทำก่อนทุกครั้ง
git tag -a pre-upgrade-next-$(date +%Y%m%d) -m "Before Next.js upgrade"
git push origin --tags

# หรือสร้าง branch backup
git checkout -b backup/before-upgrade-$(date +%Y%m%d)
git push origin backup/before-upgrade-$(date +%Y%m%d)
git checkout main
```

### ขั้นที่ 2 — สัญญาณที่ต้อง Rollback

```
🚨 ต้อง Rollback ทันที:
☐ npm run build ล้มเหลว ไม่สามารถแก้ไขได้ใน 2 ชั่วโมง
☐ Authentication ไม่ทำงาน (/auth)
☐ Dashboard หลักโหลดไม่ได้
☐ API calls ทุกตัวล้มเหลว
☐ Production server crash

⚠️  ควร Rollback ถ้า:
☐ > 20% ของ features ทำงานผิดปกติ
☐ Performance degradation > 50%
☐ Data ที่แสดงไม่ถูกต้อง
```

### ขั้นที่ 3 — ขั้นตอน Rollback

```bash
# ขั้น 1: หยุด development server (ถ้ากำลังทดสอบ)
# Ctrl+C

# ขั้น 2: ถ้า rollback บน branch upgrade
git stash  # เก็บ uncommitted changes ชั่วคราว
git checkout main  # กลับ branch หลัก

# ขั้น 3: ถ้า rollback บน main branch (หลัง merge แล้ว)
git revert HEAD  # หรือ
git reset --hard {PRE_UPGRADE_TAG}

# ขั้น 4: Restore dependencies
npm ci  # ใช้ package-lock.json — restore ที่แน่นอน

# ขั้น 5: ทดสอบ build
npm run build
```

### ขั้นที่ 4 — Rollback ใน Production (PM2)

```bash
# ขั้น 1: deploy version เก่า
git checkout {PRE_UPGRADE_TAG}
npm ci
npm run build

# ขั้น 2: restart PM2
pm2 reload ecosystem.config.js

# ขั้น 3: ตรวจสอบ
pm2 status
pm2 logs

# ขั้น 4: ตรวจสอบ application ที่ port 4040
curl http://localhost:4040
```

### ขั้นที่ 5 — Verification Checklist หลัง Rollback

```
☐ npm run build ผ่าน
☐ http://localhost:4040 เปิดได้
☐ /auth login ได้
☐ /dashboard โหลดข้อมูลได้
☐ PM2 status: online
☐ ไม่มี error ใน pm2 logs
```

### ขั้นที่ 6 — Post-mortem

หลัง rollback ให้บันทึก:
```
1. Version ที่ upgrade: X → Y
2. เหตุผลที่ rollback:
3. Error message ที่พบ:
4. ไฟล์/feature ที่ได้รับผลกระทบ:
5. แนวทางแก้ไขสำหรับการ upgrade ครั้งต่อไป:
```

## 6. Guardrails

- ❌ ห้าม `git push --force` บน main/production branch
- ❌ ห้าม rollback โดยไม่แจ้งทีมก่อน
- ❌ ห้าม rollback ใน production hours ถ้าไม่ใช่ critical issue
- ✅ บันทึก rollback เสมอ (เหตุผล, เวลา, ผู้ดำเนินการ)

## 7. Validation

```bash
npm run lint
npm run build
# pm2 status (ใน production)
```

## 8. Example Prompts

```
@workspace อ่าน rollback-plan-and-verification.md แล้วช่วยสร้าง git tag ก่อนเริ่ม upgrade
```

```
@workspace ช่วย rollback Next.js upgrade ตาม rollback-plan-and-verification.md
```

## 9. Links

- [upgrade-playbook.md](./upgrade-playbook.md)
- [codemods-and-breaking-changes-checklist.md](./codemods-and-breaking-changes-checklist.md)
