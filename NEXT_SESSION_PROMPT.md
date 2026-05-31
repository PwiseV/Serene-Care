# Prompt – Session: Admin UI Redesign + Slot Heartbeat

> Dán toàn bộ nội dung này vào đầu chat session mới với Claude Code.

---

## 0. Project Review (làm 1 lần duy nhất khi bắt đầu session)

Trước khi code, đọc theo thứ tự:
1. `PROJECT_CONTEXT.md` — hiểu basement đã có, role hệ thống, quyết định kỹ thuật
2. `SKILLS.md` — quy tắc code bắt buộc (layered MVC, Tailwind only, no over-engineering)
3. `src/auth.config.ts` + `src/proxy.ts` — hiểu middleware & session flow
4. `src/app/dashboard/admin/` — xem các file admin hiện có (page.tsx, doctors/, specialties/)
5. `src/app/layout.tsx` — nơi Header được render (cần điều chỉnh để skip Header cho admin)
6. `src/services/bookingService.ts` + `src/app/appointments/new/BookingClient.tsx` — hiểu slot lock flow trước khi làm heartbeat

Sau khi đọc xong, tóm tắt ngắn những gì hệ thống đang có, rồi mới bắt đầu implement.

---

## 1. Admin UI Redesign — Sidebar Layout

### Mục tiêu
Xây lại toàn bộ admin UI với **sidebar navigation** thay thế header toàn cục. Backend APIs cho admin đã đầy đủ — chỉ cần rebuild UI/UX.

### Layout tổng thể

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (fixed, w-64)  │  MAIN CONTENT (flex-1)    │
│  ─────────────────────  │  ─────────────────────    │
│  Logo + "ADMIN"         │  [Topbar: search + bell   │
│                         │   + avatar + tên user]    │
│  ● Tổng quan            │                           │
│  ○ Lịch hẹn             │  <page content>           │
│  ○ Bác sĩ               │                           │
│  ○ Bệnh nhân            │                           │
│  ○ Cài đặt              │                           │
│                         │                           │
│  [Đăng xuất] (bottom)   │                           │
└─────────────────────────────────────────────────────┘
```

### Bước triển khai

**Bước A – Layout shell**

Tạo `src/app/dashboard/admin/layout.tsx`:
- Server Component, đọc session (`auth()`), redirect nếu không phải admin
- Render sidebar + `{children}` trong layout 2 cột
- Sidebar dùng `"use client"` riêng (`AdminSidebar.tsx`) để handle active state theo `usePathname()`

Sửa `src/app/layout.tsx`:
- Khi `session?.user?.role === "admin"` → **không render `<Header>`** (admin dùng sidebar thay thế)

**Bước B – AdminSidebar component** (`src/app/dashboard/admin/AdminSidebar.tsx`)

Nav items:
```
{ label: "Tổng quan",  href: "/dashboard/admin",              icon: "grid_view" }
{ label: "Lịch hẹn",  href: "/dashboard/admin/appointments",  icon: "calendar_month" }
{ label: "Bác sĩ",    href: "/dashboard/admin/doctors",       icon: "stethoscope" }
{ label: "Bệnh nhân", href: "/dashboard/admin/patients",      icon: "people" }
{ label: "Cài đặt",   href: "/dashboard/admin/specialties",   icon: "settings" }
```
- Active item: highlight bằng `bg-primary text-on-primary rounded-xl`
- Bottom: nút "Đăng xuất" đỏ (`signOut({ callbackUrl: "/login" })`)
- Topbar trong main: ô search (UI only, chưa cần functional), icon chuông, avatar + tên admin

**Bước C – Tổng quan page** (rebuild `src/app/dashboard/admin/page.tsx`)

Layout gồm:
1. Greeting: "Chào buổi sáng/chiều, {name}"
2. Stats row (4 cards): Tổng lịch hẹn, Bác sĩ hoạt động, Bệnh nhân mới (30 ngày), Doanh thu tháng (tính từ appointments completed × consultationFee)
3. Bảng "Đặt lịch gần đây": 10 appointments mới nhất — hiển thị bệnh nhân, bác sĩ, chuyên khoa, trạng thái (badge màu), thời gian
4. Sidebar phải "Bác sĩ tiêu biểu": top 3 bác sĩ theo averageRating

Data: mở rộng `adminService.getAdminStats()` để trả thêm `recentAppointments[]` và `topDoctors[]`. Gọi thẳng service trong Server Component — không qua API route.

**Bước D – Lịch hẹn page** (`src/app/dashboard/admin/appointments/page.tsx`)

- Server Component với URL search params: `?status=all|pending|confirmed|cancelled|completed`
- Gọi `getAppointments()` với role `"admin"` (cần mở rộng bookingService để admin lấy tất cả)
- Table: bệnh nhân, bác sĩ, ngày giờ, trạng thái, actions (confirm / cancel)
- Filter tabs ở đầu trang

**Bước E – Bác sĩ page** (cải tiến `src/app/dashboard/admin/doctors/page.tsx`)

Hiện chỉ có pending doctors. Mở rộng thành 2 tab:
- Tab "Chờ duyệt": list pending doctors + Approve/Reject button (đã có `ApproveButton.tsx`)
- Tab "Đã duyệt": list approved doctors với info cơ bản

**Bước F – Bệnh nhân page** (`src/app/dashboard/admin/patients/page.tsx`)

- List toàn bộ users với role = "patient"
- Hiển thị: tên, email, số lịch hẹn, ngày đăng ký
- Thêm `adminService.getPatients()` vào service

**Bước G – Cài đặt** 

Giữ nguyên `src/app/dashboard/admin/specialties/page.tsx`, chỉ đổi route breadcrumb nếu cần.

### Design tokens (theo hệ thống hiện có)
- Sidebar bg: `bg-surface-container-lowest` hoặc màu primary dark
- Active nav: `bg-primary text-on-primary`
- Cards: `bg-surface-container-lowest rounded-2xl shadow-xl shadow-indigo-500/5`
- Status badges: pending=amber, confirmed=green, cancelled=red, completed=blue (giữ nguyên pattern cũ)
- Font: `font-sans` cho body, `font-heading` cho title

---

## 2. Slot Heartbeat — Giữ lock sống khi patient điền form

### Vấn đề
Lock slot hiện tại = 5 phút. Patient chọn slot rồi ngồi điền form lâu → lock expire → người khác có thể lock mất slot → patient submit bị lỗi 409.

### Giải pháp: Client ping mỗi 3 phút

**API endpoint mới:** `PATCH /api/slots/[id]/extend-lock`

```typescript
// Logic:
// 1. Auth required (patient only)
// 2. Tìm slot với _id = id, lockedBy = session.user.id (verify ownership)
// 3. Nếu lockedUntil còn > now: extend thêm 5 phút
// 4. Nếu đã expire: trả 409 "Lock expired" → client thông báo user phải chọn lại slot
// 5. Return: { lockedUntil: newDate }
```

**Client side** (`src/app/appointments/new/BookingClient.tsx`):

```typescript
// Sau khi selectedSlot được set → start heartbeat
// useEffect với cleanup:

useEffect(() => {
  if (!selectedSlot) return;
  
  const interval = setInterval(async () => {
    const res = await fetch(`/api/slots/${selectedSlot}/extend-lock`, { method: "PATCH" });
    if (!res.ok) {
      // Lock đã chết (409) → reset selection, thông báo user
      setSelectedSlot(null);
      setSlots([]); // force refetch
      setError("Phiên đặt lịch đã hết hạn. Vui lòng chọn lại khung giờ.");
    }
  }, 3 * 60 * 1000); // ping mỗi 3 phút
  
  return () => clearInterval(interval); // cleanup khi slot bị deselect hoặc unmount
}, [selectedSlot]);
```

**Lưu ý kỹ thuật:**
- Chỉ extend nếu `lockedBy === currentUser` (verify trong API)
- Không cần ping khi form đang submit (`submitting === true`)
- Nếu user chuyển tab / đóng browser: lock tự expire sau 5 phút — acceptable behavior

---

## 3. Quy tắc code cho session này (từ SKILLS.md)

- **Layered:** Service chứa business logic, API route chỉ validate + gọi service + return JSON
- **Server Components first:** Dashboard pages là Server Components; chỉ tách Client Component khi cần state/event
- **Tailwind only:** Không viết custom CSS
- **No over-engineer:** Không thêm abstraction không cần thiết. Không thêm feature chưa được yêu cầu.
- **Sau mỗi phase xong:** Cập nhật `PROJECT_CONTEXT.md` — ghi ngắn phase, file chính, quyết định quan trọng

---

## Thứ tự thực hiện đề xuất

```
Phase 9A: Layout shell (layout.tsx + AdminSidebar + root layout fix)
  → Phase 9B: Tổng quan page (mở rộng adminService + rebuild UI)
    → Phase 9C: Lịch hẹn page
      → Phase 9D: Bác sĩ page (2 tabs)
        → Phase 9E: Bệnh nhân page
          → Phase 10: Slot Heartbeat (API + client)
```
