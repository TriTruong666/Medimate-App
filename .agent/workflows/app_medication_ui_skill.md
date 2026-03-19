---
description: Medimate App - UI Component Generator Skill
---

# Medimate Reminder App - UI/UX Component Generator Skill

This document defines the design system, logic, and structures required for AI agents to consistently generate UI components tailored for senior citizens using a medication reminder application. The primary UI language is Vietnamese.

## 1. Design Language & Accessibility Rules

### Typography
- **Core Font**: Space Grotesk
- **Rule**: Must be highly legible. Minimum body text size is 16pt.
- **Weights**:
  - **Extra Bold**: Times and quantities.
  - **Bold**: Drug names, primary questions.
  - **Regular**: Instructions.

### Color Palette
- `#B8FFA9` (Active Green): Use for "Đã uống" (Taken) actions, positive feedback, and Sáng (Morning) indicators.
- `#FFC6A8` (Peach): Use for upcoming/urgent medications or Chiều (Afternoon) indicators.
- `#EACEFF` (Lavender): Use for daily progress/stats or Tối (Evening) indicators.
- `#000000` (Main Black): For primary text, high-contrast readability, active tab indicator, and thick borders.
- `#FFFFFF` (Background White): For negative space, secondary buttons, and text over dark colors.

### Layout & Visual Style
- **Structure**: Bento Grid layout for the dashboard.
- **Touch Targets**: Minimum 48x48dp for any clickable area (accommodates motor skill limitations in the elderly).
- **Style**: **Soft Neo-Brutalism**.
  - Large border-radius (24-32px).
  - Bold 2-3px black (`#000000`) borders on all cards for maximum contrast and visual separation.
  - **NO soft blur shadows** (they decrease legibility for aging eyes).
- **Icons**: Literal and easily recognizable (e.g., pill, glass of water, clock, sun, moon).

---

## 2. Component Specifications

When requested to generate the dashboard, assemble the following components according to these strict rules:

### 2.1 Personalization & Greeting Section
- **Structure**: Top horizontal banner. Includes a prominent user avatar.
- **Text**: 
  - Sub-greeting: "Chào buổi sáng, [Tên Ông/Bà]" (Space Grotesk Regular, 18pt)
  - Headline: "Đến giờ uống thuốc rồi!" (Space Grotesk Extra Bold, 28pt+)

### 2.2 Time-of-Day Selector (Filters)
- **Structure**: Row of 4 horizontal cards acting as a timeline: `Sáng`, `Trưa`, `Chiều`, `Tối`.
- **Visuals**: Distinct literal icons for each time (Sunrise, Sun, Sunset, Moon).
- **Logic**: Auto-select the current time of day. 
  - **Active State**: Fill card background with designated color (e.g., `#B8FFA9` for Sáng). 
  - **Inactive State**: Background white `#FFFFFF` with thick black border `#000000`.

### 2.3 Core Data Cards (Bento Grid)
- **Next Dose Card (Thuốc sắp uống)**
  - Background: `#FFC6A8` (Attention-grabbing)
  - Content: Huge time display (e.g., "08:00 Sáng" - Extra Bold). Drug name (e.g., "Panadol x2 viên" - Bold). Instruction (e.g., "Uống sau khi ăn" - Regular).
  - Icon: Large 3D Pill icon.
- **Daily Progress Card (Tiến độ hôm nay)**
  - Background: `#EACEFF`
  - Content: Circular or simple bar progress indicator. Text: "Đã uống 2/4 liều" (Extra Bold). Helps the elderly user know if they forgot something today.

### 2.4 Primary Action Card (Xác nhận uống thuốc)
- **Structure**: Massive, full-width card placed centrally.
- **Background**: `#B8FFA9`
- **Text**: "Ông/Bà đã uống [Tên Thuốc] chưa?" (Space Grotesk Bold).
- **Action Buttons** (Extremely large):
  - **Button 1 (Primary)**: Black background `#000000`, White text `#FFFFFF` -> Label: "ĐÃ UỐNG"
  - **Button 2 (Secondary)**: White background `#FFFFFF`, Black text `#000000`, Black border -> Label: "BỎ QUA"
- **Interaction Logic**: Tapping "ĐÃ UỐNG" logs the time, triggers a rewarding sound/animation, and then queues the next medication.

### 2.5 Bottom Navigation Bar
- **Structure**: High-contrast bottom bar with large icons and clear Vietnamese labels.
- **Items**: `Trang chủ` (Home), `Lịch uống` (Schedule), `Tủ thuốc` (Pillbox), `Cài đặt` (Settings).
- **Active State**: Indicated by a thick black `#000000` underline or a filled black icon.

---

## 3. Data Structure Definition (JSON format)

When injecting dynamic data into these components, utilize the following JSON structure template:

```json
{
  "user": {
    "name": "Ông Dũng",
    "avatarUrl": "https://example.com/avatar.png"
  },
  "currentTimePeriod": "Sáng",
  "dailyProgress": {
    "taken": 2,
    "total": 4
  },
  "nextMedication": {
    "time": "08:00 Sáng",
    "drugName": "Panadol",
    "quantity": 2,
    "unit": "viên",
    "instruction": "Uống sau khi ăn"
  }
}
```

## 4. Output Generation Rule
When generating code (React, React Native, or standard HTML/CSS):
1. **Color & Border Mapping**: Strictly map these styles to the provided CSS/StyleSheet classes or inline objects. Ensure 2px+ borders exist on every block-level container.
2. **Hit Slopes / Touch Targets**: Strictly enforce the `min-height: 48px` and `min-width: 48px` constraints for anything clickable (Buttons, Nav items, Cards).
3. **Typography Enforcement**: Validate that the `Space Grotesk` font family stack is correctly applied via context or styles with the minimum sizings respected.
