# .agent — Agent Configuration

## โครงสร้างของ directory นี้

```
.agent/
└── skill/
    ├── README.md          ← จุดเริ่มต้นของ skill pack
    └── skills/
        ├── accessibility/
        ├── composition-patterns/
        ├── frontend-design/
        ├── next-best-practices/
        ├── next-cache-components/
        ├── next-upgrade/
        ├── react-best-practices/
        ├── tailwind-css-patterns/
        └── typescript-advanced-types/
```

## Skill Pack

Skill Pack คือชุด playbook สำหรับ GitHub Copilot Chat  
แต่ละ skill อธิบายขั้นตอนการทำงานที่ถูกต้องตาม stack จริงของ repo นี้

**ดูรายละเอียดทั้งหมด:** [skill/README.md](./skill/README.md)

## การใช้งาน

1. เปิด Copilot Chat ใน VS Code
2. อ้างอิง skill ที่ต้องการ:

```
@workspace อ่าน /.agent/skill/skills/accessibility/a11y-audit-checklist.md แล้วตรวจสอบ component นี้
```

## กฎสำคัญ

- Skills เป็น reference guide — ไม่ใช่ copy-paste
- ถ้า skill ขัดแย้งกับ README.md ของ repo → README.md ชนะ
- ดู README.md ก่อนใช้ skill เสมอ
