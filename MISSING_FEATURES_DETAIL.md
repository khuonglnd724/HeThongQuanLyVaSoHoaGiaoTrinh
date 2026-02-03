# MÔ TẢ CHI TIẾT CÁC CHỨC NĂNG CÒN THIẾU

## 📌 DANH SÁCH CHỨC NĂNG THIẾU (8 FEATURES)

---

## 1️⃣ COLLABORATIVE REVIEW SYSTEM (Lecturer & HOD)

### 🎯 Mục đích
Cho phép giảng viên trong cùng khoa/bộ môn cùng xem xét, đánh giá, comment lên giáo trình của nhau trước khi trưởng khoa duyệt chính thức.

### 📋 Chức năng chi tiết

#### A. LECTURER - Collaborative Review Page
**Vị trí:** `modules/lecturer/pages/CollaborativeReview.jsx`

**Features cần có:**

1. **Danh sách giáo trình đang trong giai đoạn Collaborative Review**
   - Hiển thị table: Tên giáo trình, Môn học, Tác giả, Ngày gửi review, Deadline
   - Filter: Theo khoa, theo môn, theo trạng thái (pending review, reviewed, commented)
   - Status badge: "Waiting for review", "In progress", "Completed"

2. **View Syllabus để Review**
   - Xem toàn bộ nội dung giáo trình
   - Highlight các section: Course Info, CLO, Topics, Assessment...
   - Read-only mode (không được sửa nội dung trực tiếp)

3. **Comment System - Inline Comments**
   - Click vào bất kỳ section nào → Popup comment box
   - Comment types:
     - ✅ Suggest (đề xuất thay đổi)
     - ⚠️ Question (đặt câu hỏi)
     - ❌ Issue (phát hiện lỗi)
     - 💡 Idea (ý tưởng cải tiến)
   - Tag người khác (@mention lecturer, @HOD)
   - Attach files (nếu cần tài liệu tham khảo)

4. **Comment Thread View**
   - Xem tất cả comments đã có trên giáo trình
   - Reply to comments (tạo thread conversation)
   - Resolve comment (đánh dấu đã xử lý)
   - Filter comments: By type, by author, by section

5. **Review Summary Form**
   - Sau khi review xong, điền form tóm tắt:
     - Overall rating: 1-5 stars
     - Strengths (điểm mạnh)
     - Weaknesses (điểm yếu)
     - Suggestions (đề xuất)
     - Recommendation: Approve / Revise / Reject
   - Submit review → Gửi cho tác giả và trưởng khoa

6. **Notification**
   - Khi được mời review giáo trình
   - Khi có người reply comment của mình
   - Khi có người tag @mention
   - Khi tác giả cập nhật giáo trình sau khi nhận feedback

---

#### B. LECTURER (Author) - Manage Feedback
**Vị trí:** Thêm tab "Received Feedback" trong `SyllabusEditorPage.jsx`

**Features:**

1. **View All Comments**
   - Xem tất cả comments từ reviewers
   - Group by section hoặc by reviewer
   - Filter: Unresolved / Resolved / All

2. **Respond to Comments**
   - Reply to each comment
   - Mark as "Resolved" hoặc "Won't fix" với lý do

3. **Track Changes**
   - Khi sửa giáo trình dựa trên feedback
   - Log change: "Fixed based on Dr. X's comment #12"
   - Link comment → change history

4. **Re-submit for Review**
   - Sau khi sửa xong, re-submit
   - Notify reviewers về version mới
   - Compare: Version before vs after feedback

---

#### C. HOD - Manage Collaborative Period
**Vị trí:** `modules/academic/pages/CollaborativeManagement.jsx`

**Features:**

1. **Create Review Period**
   - Chọn giáo trình cần review
   - Set timeline: Start date → End date
   - Assign reviewers: Chọn giảng viên trong khoa (min 2-3 người)
   - Set rules: Số lượng review tối thiểu, deadline

2. **Monitor Review Progress**
   - Dashboard: % completion rate
   - Table: Reviewer | Assigned syllabuses | Completed | Pending
   - Heatmap: Activity log (ai đang active review)
   - Send reminders: Email/notification cho reviewer chưa hoàn thành

3. **View All Feedback**
   - Xem tổng hợp feedback từ tất cả reviewers
   - Analyze: Common issues, agreement level giữa reviewers
   - Export report: PDF summary of collaborative review

4. **Make Final Decision**
   - Đọc syllabus + all feedback
   - Make decision:
     - ✅ Approve → Send to Academic Affairs
     - 🔄 Request Revision → Send back to author với consolidated feedback
     - ❌ Reject → Ghi rõ lý do
   - Override reviewer opinions (nếu cần)

---

### 🔧 Backend Requirements

**New Tables:**
```sql
collaborative_review_periods (
  id, syllabus_id, created_by (HOD), 
  start_date, end_date, status, 
  min_reviewers_required
)

assigned_reviewers (
  id, review_period_id, reviewer_id (lecturer),
  status (pending/in_progress/completed)
)

review_comments (
  id, syllabus_id, section_id, 
  commenter_id, comment_type, 
  content, parent_comment_id (for thread),
  status (open/resolved)
)

review_summaries (
  id, syllabus_id, reviewer_id,
  rating, strengths, weaknesses, 
  suggestions, recommendation
)
```

**New APIs:**
```
POST   /api/collaborative-reviews/create-period
GET    /api/collaborative-reviews/my-assignments (lecturer)
POST   /api/collaborative-reviews/comments
PUT    /api/collaborative-reviews/comments/:id/reply
PUT    /api/collaborative-reviews/comments/:id/resolve
POST   /api/collaborative-reviews/submit-summary
GET    /api/collaborative-reviews/syllabi/:id/feedback
```

---

### 🎨 UI Components cần tạo

```jsx
components/collaborative/
├── ReviewPeriodCard.jsx          // Card hiển thị period
├── ReviewerAssignment.jsx        // Assign reviewers UI
├── InlineCommentButton.jsx       // Button để comment
├── CommentThread.jsx             // Thread conversation
├── CommentTypeSelector.jsx       // Chọn type comment
├── ReviewSummaryForm.jsx         // Form tóm tắt review
├── FeedbackTimeline.jsx          // Timeline feedback
└── ReviewProgressChart.jsx       // Chart % completion
```

---

## 2️⃣ STUDENT FEEDBACK FORM

### 🎯 Mục đích
Cho phép sinh viên báo cáo lỗi, gửi feedback, đề xuất cải tiến cho giáo trình khi đang học hoặc xem.

### 📋 Chức năng chi tiết

#### A. STUDENT - Submit Feedback
**Vị trí:** Thêm button "📝 Report Issue / Feedback" trong `PublicSyllabusDetailPage.jsx`, `ViewSyllabi.jsx`

**Features:**

1. **Feedback Button Location**
   - Floating button góc phải màn hình (sticky)
   - Hoặc button cuối mỗi section của syllabus

2. **Feedback Modal Form**
   - **Feedback Type:**
     - 🐛 Bug/Error (lỗi chính tả, sai thông tin)
     - 💡 Suggestion (đề xuất cải tiến nội dung)
     - ❓ Question (thắc mắc về nội dung)
     - 📚 Resource Request (đề xuất thêm tài liệu)
     - ⚠️ Outdated Content (nội dung lỗi thời)
   
   - **Related Section:** Dropdown chọn section liên quan
     - Course Information
     - Learning Outcomes (CLO)
     - Topics (Week X)
     - Assessment Methods
     - References
     - Other

   - **Description:** Textarea mô tả chi tiết (required, min 20 chars)
   
   - **Screenshot Upload:** (optional) Upload ảnh minh họa lỗi
   
   - **Priority:** Low / Medium / High (student tự đánh giá)
   
   - **Anonymous Option:** Checkbox "Submit anonymously"

3. **Submit Confirmation**
   - Show success message + Tracking ID (e.g., "FB-2026-0001")
   - Copy tracking ID to clipboard
   - Email confirmation (nếu không anonymous)

4. **View My Feedback History**
   - Thêm tab "My Feedback" trong Student Dashboard
   - Table: Tracking ID | Syllabus | Type | Status | Submitted Date
   - Status: Pending / Under Review / Resolved / Closed
   - Click vào xem detail + response từ lecturer/admin

---

#### B. LECTURER - Manage Feedback
**Vị trí:** Thêm tab "Student Feedback" trong `SyllabusListPage.jsx`

**Features:**

1. **Feedback Dashboard**
   - Counter badges: Total feedback, Pending, Resolved
   - Filter: By type, by priority, by syllabus

2. **Feedback Detail View**
   - Student info (hoặc "Anonymous")
   - Feedback content + screenshot
   - Section liên quan

3. **Actions:**
   - **Mark as Reviewed:** Đã xem, đang xử lý
   - **Respond:** Write response to student
   - **Fix & Close:** Đã sửa lỗi trong giáo trình
   - **Won't Fix:** Giải thích lý do không sửa
   - **Forward to HOD:** Escalate nếu cần quyết định cấp cao hơn

4. **Notification:**
   - Khi có feedback mới
   - Khi feedback critical (High priority)

---

#### C. ADMIN - Feedback Statistics
**Vị trí:** Thêm section trong `AdminDashboard.jsx`

**Features:**

1. **System-wide Feedback Stats**
   - Total feedback received
   - Average response time
   - Resolution rate
   - Top reported issues

2. **Export Reports**
   - Monthly feedback summary
   - By department/faculty
   - Quality metrics

---

### 🔧 Backend Requirements

**New Tables:**
```sql
student_feedback (
  id, tracking_id, 
  syllabus_id, section_id,
  student_id (nullable if anonymous),
  feedback_type, priority,
  description, screenshot_url,
  status, is_anonymous,
  submitted_at
)

feedback_responses (
  id, feedback_id, responder_id,
  response_text, action_taken,
  responded_at
)
```

**New APIs:**
```
POST   /api/feedback/submit
GET    /api/feedback/my-feedback (student)
GET    /api/feedback/lecturer/:lecturerId (lecturer)
PUT    /api/feedback/:id/respond
PUT    /api/feedback/:id/status
GET    /api/feedback/stats (admin)
```

---

### 🎨 UI Components

```jsx
components/feedback/
├── FeedbackButton.jsx           // Floating button
├── FeedbackModal.jsx            // Modal form
├── FeedbackTypeSelector.jsx    // Type dropdown
├── SectionSelector.jsx          // Section dropdown
├── FeedbackCard.jsx             // Card hiển thị feedback
├── FeedbackStatusBadge.jsx     // Status badge
├── ResponseForm.jsx             // Lecturer response form
└── FeedbackTimeline.jsx        // Timeline xử lý
```

---

## 3️⃣ AI SUMMARY DISPLAY

### 🎯 Mục đích
Hiển thị tóm tắt nội dung giáo trình do AI tự động sinh, giúp sinh viên nhanh chóng nắm bắt tổng quan môn học.

### 📋 Chức năng chi tiết

#### A. AI Summary Section
**Vị trí:** Thêm section đầu tiên trong `PublicSyllabusDetailPage.jsx`

**Features:**

1. **Summary Card Position**
   - Ngay dưới Course Title & Basic Info
   - Collapsible section (có thể thu gọn)
   - Icon: 🤖 AI-Generated Summary

2. **Summary Content Structure**

   **a. Course Overview (100-150 words)**
   - Mô tả tổng quan môn học
   - Mục tiêu chính
   - Phù hợp với đối tượng nào

   **b. Key Learning Outcomes (Bullet points)**
   - 3-5 điểm chính sinh viên sẽ học được
   - Simplified từ CLOs

   **c. Main Topics Covered**
   - List 5-7 chủ đề chính
   - Group theo module/chapter

   **d. Assessment Summary**
   - Phương thức đánh giá chính
   - Tỷ trọng điểm (pie chart nhỏ)

   **e. Study Time Estimate**
   - Ước tính giờ tự học/tuần
   - Total course hours

   **f. Difficulty Level**
   - Indicator: Beginner / Intermediate / Advanced
   - Prerequisite knowledge required

3. **AI Confidence Score**
   - Show confidence: "Generated with 92% confidence"
   - Disclaimer: "AI-generated, please refer to full syllabus"

4. **User Actions**
   - 👍 👎 Thumbs up/down (feedback về chất lượng AI)
   - 🔄 Regenerate (yêu cầu AI tạo lại)
   - 📋 Copy summary
   - 🔗 Share summary link

5. **Expand to Full Syllabus**
   - Button "View Full Syllabus" → Scroll to detailed sections

---

#### B. AI Summary in Search Results
**Vị trí:** `PublicSyllabusSearchPage.jsx`

**Features:**

1. **Summary Preview in Cards**
   - Show first 2-3 lines của AI summary
   - "Read more" → Navigate to detail

2. **Filter by Difficulty**
   - Filter: Beginner / Intermediate / Advanced
   - Dựa trên AI-detected difficulty

---

### 🔧 Backend Requirements

**Existing AI Service:** Backend đã có AI service

**New Table:**
```sql
ai_summaries (
  id, syllabus_id, 
  summary_overview, key_outcomes,
  main_topics, assessment_summary,
  study_time_estimate, difficulty_level,
  confidence_score,
  generated_at, version
)

ai_feedback (
  id, summary_id, user_id,
  feedback_type (thumbs_up/down),
  comment
)
```

**New APIs:**
```
GET    /api/ai/summaries/:syllabusId
POST   /api/ai/summaries/:syllabusId/regenerate
POST   /api/ai/summaries/:id/feedback
```

---

### 🎨 UI Components

```jsx
components/ai/
├── AISummaryCard.jsx           // Main summary card
├── AIDifficultyBadge.jsx       // Difficulty indicator
├── AIConfidenceBar.jsx         // Confidence score bar
├── AIFeedbackButtons.jsx       // Thumbs up/down
├── KeyOutcomesList.jsx         // CLO summary list
├── TopicsList.jsx              // Main topics
├── StudyTimeEstimate.jsx       // Time estimate widget
└── AssessmentPieChart.jsx      // Assessment breakdown chart
```

---

## 4️⃣ SUBJECT RELATIONSHIP TREE

### 🎯 Mục đích
Hiển thị mối quan hệ giữa các môn học (prerequisite/corequisite/postrequisite) dưới dạng cây hoặc graph, giúp sinh viên hiểu roadmap học tập.

### 📋 Chức năng chi tiết

#### A. Subject Relationship Visualization
**Vị trí:** Thêm tab "Subject Relationships" trong `PublicSyllabusDetailPage.jsx`

**Features:**

1. **Tree/Graph Visualization**
   - **Vertical Tree View:** (default)
     - Current subject ở giữa
     - Prerequisites ở trên (màu cam)
     - Corequisites ở ngang (màu xanh)
     - Postrequisites ở dưới (màu tím)
   
   - **Network Graph View:** (alternative)
     - Interactive graph với nodes & edges
     - Zoom in/out
     - Drag nodes
     - Hover: Show subject info tooltip

2. **Node Information**
   - Subject Code + Name
   - Credits
   - Status badge:
     - ✅ Completed (nếu logged in student)
     - 🔄 Enrolled
     - 🔒 Locked (chưa đủ điều kiện)
     - ⭕ Available

3. **Relationship Types**
   - **Prerequisite (Môn tiên quyết):** Phải học trước
     - Arrow: ↓ (from prerequisite to current)
     - Label: "Required"
   
   - **Corequisite (Môn song hành):** Học cùng lúc
     - Line: ↔ (bidirectional)
     - Label: "Together"
   
   - **Postrequisite (Môn kế tiếp):** Học sau môn này
     - Arrow: ↓ (from current to postrequisite)
     - Label: "Next step"

4. **Interactive Features**
   - **Click on Node:** Navigate to that subject's syllabus
   - **Highlight Path:** Click "Show my path" → Highlight recommended learning path
   - **Filter View:**
     - Show only Prerequisites
     - Show only Postrequisites
     - Show entire program tree

5. **Legend & Controls**
   - Legend: Color coding explanation
   - View switcher: Tree / Graph / List
   - Zoom controls: +/- buttons
   - Reset view button
   - Fullscreen mode

6. **Program Context**
   - Show "Position in Program": Year X, Semester Y
   - Show "Program: Bachelor of Computer Science"
   - Link to full program curriculum

---

#### B. Program Curriculum Map
**Vị trí:** Thêm page mới `modules/public/pages/ProgramCurriculumMap.jsx`

**Features:**

1. **Full Program Visualization**
   - Show all subjects in program
   - Organized by year & semester
   - Connected with relationship arrows

2. **Progressive Disclosure**
   - Collapsible by year
   - Click year → Expand subjects
   - Click subject → Show relationships

3. **Search & Filter**
   - Search subject by name/code
   - Filter by category (Core / Elective / General)
   - Filter by status (if logged in)

---

### 🔧 Backend Requirements

**Existing Data:** Backend có subject relationships

**New Table (if not exists):**
```sql
subject_relationships (
  id, subject_id, related_subject_id,
  relationship_type (prerequisite/corequisite/postrequisite),
  is_strict (true/false)
)

program_structure (
  id, program_id, subject_id,
  year, semester, category
)
```

**New APIs:**
```
GET    /api/subjects/:id/relationships
GET    /api/subjects/:id/tree (recursive tree)
GET    /api/programs/:id/curriculum-map
GET    /api/students/:id/progress (completed subjects)
```

---

### 🎨 UI Components & Libraries

**Libraries cần:**
- `react-flow` or `reactflow` (for interactive graph)
- `d3.js` (for tree visualization)
- `vis-network` (alternative for network graph)

**Components:**
```jsx
components/subject-tree/
├── SubjectTreeView.jsx          // Main tree component
├── SubjectNode.jsx              // Tree node
├── RelationshipEdge.jsx         // Connecting arrow
├── SubjectTooltip.jsx           // Hover tooltip
├── TreeControls.jsx             // Zoom, reset, view switcher
├── TreeLegend.jsx               // Color legend
├── ProgramMapView.jsx           // Full program view
└── LearningPathHighlight.jsx   // Path highlighting
```

---

## 5️⃣ CLO-PLO MAPPING MATRIX

### 🎯 Mục đích
Hiển thị ma trận ánh xạ giữa CLO (Course Learning Outcomes) và PLO (Program Learning Outcomes), giúp thấy môn học đóng góp như thế nào vào chuẩn đầu ra của chương trình đào tạo.

### 📋 Chức năng chi tiết

#### A. CLO-PLO Matrix View
**Vị trí:** Thêm tab "CLO-PLO Mapping" trong `PublicSyllabusDetailPage.jsx`

**Features:**

1. **Matrix Table**
   - **Rows:** CLO1, CLO2, CLO3, ... (Course Learning Outcomes)
   - **Columns:** PLO1, PLO2, PLO3, ... PLO12 (Program Learning Outcomes)
   - **Cells:** 
     - Empty: Không liên quan
     - ●: Low contribution
     - ●●: Medium contribution
     - ●●●: High contribution
     - Or: Numeric (1=Low, 2=Medium, 3=High)

2. **Interactive Table**
   - **Hover on Cell:** Show tooltip
     - CLO text
     - PLO text
     - Contribution level
     - Mapped by assessment method
   
   - **Click on CLO:** Expand row to show full CLO description
   - **Click on PLO:** Highlight column, show all courses contributing to this PLO

3. **Color Coding**
   - Heatmap colors:
     - White/Light: No/Low contribution
     - Yellow: Medium contribution
     - Green: High contribution
   - Or use dots (●●●) for clearer visualization

4. **Summary Stats**
   - **CLO Coverage:** % of CLOs mapped to PLOs
   - **PLO Coverage:** Which PLOs this course supports most
   - **Top Mappings:** Top 3 strongest CLO-PLO connections

5. **Export Options**
   - Download as PNG (image)
   - Download as PDF
   - Download as Excel (for analysis)

---

#### B. CLO Details with Assessment Link
**Features:**

1. **CLO Card**
   - CLO text
   - Mapped PLOs: PLO1, PLO3, PLO5
   - Assessment methods: Midterm (30%), Final (40%), Project (30%)
   - Bloom's Taxonomy level: Remember, Understand, Apply...

2. **Show Assessment Alignment**
   - Table: Assessment Method | CLO | PLO | Weight
   - Example:
     ```
     Midterm Exam → CLO1, CLO2 → PLO1, PLO2 → 30%
     Final Project → CLO3, CLO4 → PLO3, PLO5 → 40%
     ```

---

#### C. Program-Level PLO View
**Vị trí:** Thêm page `modules/public/pages/ProgramPLODashboard.jsx`

**Features:**

1. **PLO Achievement Dashboard**
   - List all PLOs của chương trình (PLO1-PLO12)
   - For each PLO: Show contributing courses
   - Chart: PLO coverage across all courses

2. **PLO Detail Modal**
   - PLO description
   - Related courses (list with links)
   - Cumulative assessment (nếu có data sinh viên)

---

### 🔧 Backend Requirements

**Existing Data:** Backend có CLO-PLO mapping

**New Table (if not exists):**
```sql
clo_plo_mapping (
  id, syllabus_id, clo_id, plo_id,
  contribution_level (1=Low, 2=Medium, 3=High)
)

program_plos (
  id, program_id, plo_code, plo_description,
  category (knowledge/skills/competence)
)

assessment_clo_mapping (
  id, syllabus_id, assessment_id, clo_id,
  weight_percentage
)
```

**New APIs:**
```
GET    /api/syllabi/:id/clo-plo-matrix
GET    /api/programs/:id/plos
GET    /api/programs/:id/plo-coverage
GET    /api/syllabi/:id/assessment-alignment
```

---

### 🎨 UI Components

```jsx
components/clo-plo/
├── CLOPLOMatrix.jsx             // Main matrix table
├── MatrixCell.jsx               // Interactive cell
├── CLOCard.jsx                  // CLO detail card
├── PLOCard.jsx                  // PLO detail card
├── HeatmapLegend.jsx           // Color legend
├── CoverageSummary.jsx         // Summary stats
├── AssessmentAlignment.jsx     // Assessment table
└── ExportMatrixButton.jsx      // Export button
```

**Libraries:**
- `react-table` or `@tanstack/react-table` (for interactive table)
- `recharts` (for coverage charts)
- `html2canvas` + `jspdf` (for export to PDF/PNG)

---

## 6️⃣ MOBILE APP (React Native)

### 🎯 Mục đích
Ứng dụng di động dành cho sinh viên, cho phép tra cứu giáo trình, theo dõi môn học, nhận thông báo push mọi lúc mọi nơi.

### 📋 Chức năng chi tiết

#### Project Structure
```
smd-mobile-app/
├── src/
│   ├── screens/               # Màn hình chính
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── Home/
│   │   │   └── HomeScreen.js
│   │   ├── Search/
│   │   │   ├── SearchScreen.js
│   │   │   └── FilterScreen.js
│   │   ├── Syllabus/
│   │   │   ├── SyllabusListScreen.js
│   │   │   ├── SyllabusDetailScreen.js
│   │   │   └── SyllabusCompareScreen.js
│   │   ├── Enrolled/
│   │   │   ├── MyCoursesScreen.js
│   │   │   └── CourseDetailScreen.js
│   │   ├── Followed/
│   │   │   └── FollowedSyllabusScreen.js
│   │   ├── Notifications/
│   │   │   └── NotificationsScreen.js
│   │   └── Profile/
│   │       ├── ProfileScreen.js
│   │       └── SettingsScreen.js
│   ├── components/            # Component tái sử dụng
│   │   ├── SyllabusCard.js
│   │   ├── SearchBar.js
│   │   ├── FilterChip.js
│   │   ├── BottomTabBar.js
│   │   └── LoadingSpinner.js
│   ├── navigation/            # Navigation setup
│   │   ├── AppNavigator.js
│   │   ├── AuthStack.js
│   │   └── MainTabs.js
│   ├── services/              # API calls
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── syllabusService.js
│   │   └── notificationService.js
│   ├── store/                 # State management (Redux/Zustand)
│   │   ├── authSlice.js
│   │   ├── syllabusSlice.js
│   │   └── store.js
│   ├── utils/
│   │   ├── storage.js         # AsyncStorage helper
│   │   └── constants.js
│   └── App.js
├── android/
├── ios/
├── package.json
└── app.json
```

---

### 📱 Screens & Features

#### 1. **HomeScreen**
- Welcome banner
- Quick search bar
- Featured syllabi (carousel)
- Recent updates
- Quick access buttons:
  - My Courses
  - Search All
  - Followed Syllabi

#### 2. **SearchScreen**
**Features:**
- Search bar với autocomplete
- Recent searches
- Popular searches
- Filter button → Open FilterScreen
- Results: List/Grid view
- Sort: Relevance, Latest, Name A-Z

**FilterScreen:**
- Faculty/Department selector
- Course level: Undergraduate/Graduate
- Semester/Year
- Credits: Range slider
- Has Prerequisites: Toggle
- Apply filters button

#### 3. **SyllabusDetailScreen**
**Features:**
- Course header: Code, Name, Credits
- Tabs:
  - Overview (AI Summary)
  - Details (Full syllabus)
  - CLO/PLO
  - Assessments
  - Schedule (Topics by week)
  - Resources (References)
- Actions:
  - ⭐ Follow/Unfollow
  - 📤 Share (share link)
  - 📥 Download PDF (offline)
  - 📝 Send Feedback
  - 🔔 Subscribe to updates
- Floating button: Back to top

#### 4. **MyCoursesScreen**
- List enrolled courses (from student's schedule)
- For each course:
  - Course name
  - Lecturer
  - Schedule: Mon 8:00-10:00, Room A101
  - Quick link to syllabus
  - Attendance rate (if data available)
  - Upcoming assignments

#### 5. **FollowedSyllabusScreen**
- List followed syllabi
- Show notification badge if updated
- Swipe to unfollow
- Tap to view detail

#### 6. **NotificationsScreen**
**Types of notifications:**
- Syllabus updated (for followed items)
- New syllabus published in your program
- Feedback response from lecturer
- Course enrollment opened
- Deadline reminders

**Features:**
- Mark as read
- Clear all
- Filter: All / Unread / Important
- Push notification integration

#### 7. **ProfileScreen**
- Student info: Name, ID, Program
- My Statistics:
  - Enrolled courses
  - Followed syllabi
  - Feedback submitted
- Settings button
- Logout

#### 8. **SettingsScreen**
- Notification preferences
  - Push notifications ON/OFF
  - Email notifications ON/OFF
  - Notification types (checkboxes)
- Appearance
  - Dark mode toggle
  - Font size: Small / Medium / Large
- Data & Storage
  - Downloaded syllabi (offline)
  - Clear cache
- About
  - App version
  - Terms of Service
  - Privacy Policy

---

### 🔧 Technical Requirements

#### A. Libraries & Packages

```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "react-navigation": "^6.0",
    "@react-navigation/native": "^6.0",
    "@react-navigation/bottom-tabs": "^6.0",
    "@react-navigation/stack": "^6.0",
    "react-native-vector-icons": "^10.0",
    "axios": "^1.6",
    "@react-native-async-storage/async-storage": "^1.21",
    "react-native-push-notification": "^8.1",
    "@notifee/react-native": "^7.8",
    "react-native-pdf": "^6.7",
    "react-native-share": "^10.0",
    "react-native-webview": "^13.6",
    "@reduxjs/toolkit": "^2.0",
    "react-redux": "^9.0",
    "react-native-toast-message": "^2.1"
  }
}
```

#### B. Backend Integration
- Same REST APIs as web app
- JWT token authentication
- Refresh token mechanism
- API base URL configurable (dev/prod)

#### C. Push Notifications
**Service:** Firebase Cloud Messaging (FCM)

**Setup:**
1. Register device token on login
2. Send token to backend: `POST /api/devices/register`
3. Backend sends push via FCM when events occur
4. App receives & displays notification

**Notification Payload:**
```json
{
  "title": "Syllabus Updated",
  "body": "CS101 syllabus has been updated",
  "data": {
    "type": "syllabus_update",
    "syllabusId": "123",
    "action": "navigate_to_detail"
  }
}
```

#### D. Offline Mode
- Cache syllabi using AsyncStorage
- Download PDF for offline reading
- Sync when back online
- Show offline indicator

---

### 🎨 Design Guidelines

**UI Framework:** React Native Paper or NativeBase

**Design System:**
- Colors: Match web app theme
- Typography: Roboto / SF Pro
- Spacing: 8px grid system
- Components: Material Design 3 style

**Responsive:**
- Support Android & iOS
- Phone sizes: 5" - 6.7"
- Tablet support (bonus)

---

### 📦 Deployment

**Android:**
- Build APK/AAB
- Upload to Google Play Store
- Internal testing → Beta → Production

**iOS:**
- Build IPA
- Upload to App Store Connect
- TestFlight → App Store

---

## 7️⃣ NOTIFICATION CENTER (Real-time)

### 🎯 Mục đích
Hiển thị thông báo real-time cho tất cả user về các sự kiện quan trọng trong hệ thống.

### 📋 Chức năng chi tiết

#### A. Notification Bell Icon
**Vị trí:** Header của tất cả portals (Admin, Lecturer, Student, Academic)

**Features:**

1. **Bell Icon với Badge**
   - 🔔 Icon bell ở góc phải header
   - Red badge số: Unread count (e.g., "3")
   - Ring animation khi có notification mới
   - Hover: Show tooltip "Notifications"

2. **Notification Dropdown**
   - Click bell → Dropdown panel (max 300px height)
   - Header: "Notifications" + "Mark all as read"
   - List: Latest 10 notifications
   - Footer: "View all notifications" → Navigate to full page

3. **Notification Item**
   - Icon (theo type)
   - Title (bold if unread)
   - Message (truncate)
   - Timestamp: "2 minutes ago", "1 hour ago"
   - Click → Navigate to related item + mark as read
   - Hover → Show delete button (X)

4. **Notification Types & Icons**
   - 📝 Syllabus updated: "CS101 syllabus has been updated"
   - ✅ Approval: "Your syllabus has been approved by HOD"
   - ❌ Rejection: "Your syllabus needs revision"
   - 💬 Comment: "Dr. X commented on your syllabus"
   - 👤 Mention: "@You in a collaborative review"
   - 📤 Assigned: "You've been assigned to review CS202"
   - 🎓 Enrollment: "New students enrolled in your course"
   - ⚠️ Deadline: "Syllabus submission deadline in 3 days"
   - 🔔 System: "System maintenance scheduled"

5. **Real-time Updates**
   - Websocket connection (Socket.io or SSE)
   - Toast notification (bottom-right) khi có notification mới
   - Sound notification (có thể bật/tắt trong settings)

---

#### B. Notification Center Page
**Vị trí:** `/notifications` trong mỗi portal

**Features:**

1. **Full Notification List**
   - Paginated list (20 per page)
   - Filter tabs:
     - All
     - Unread
     - Mentions
     - Approvals
     - Comments
   - Sort: Latest first / Oldest first

2. **Bulk Actions**
   - Select multiple notifications
   - Mark as read/unread
   - Delete selected

3. **Search Notifications**
   - Search by keyword
   - Filter by date range
   - Filter by type

---

### 🔧 Backend Requirements

**New Table:**
```sql
notifications (
  id, user_id, 
  type (syllabus_update/approval/comment/mention/...),
  title, message, 
  related_entity_type (syllabus/comment/review),
  related_entity_id,
  is_read, 
  created_at
)

notification_preferences (
  user_id, 
  notification_type, 
  email_enabled, 
  push_enabled, 
  in_app_enabled
)
```

**New APIs:**
```
GET    /api/notifications (with pagination)
GET    /api/notifications/unread-count
PUT    /api/notifications/:id/mark-read
PUT    /api/notifications/mark-all-read
DELETE /api/notifications/:id
POST   /api/notifications/preferences
WebSocket: ws://api-gateway/notifications (real-time)
```

---

### 🎨 UI Components

```jsx
components/notifications/
├── NotificationBell.jsx         // Bell icon with badge
├── NotificationDropdown.jsx     // Dropdown panel
├── NotificationItem.jsx         // Single notification
├── NotificationList.jsx         // Full page list
├── NotificationFilters.jsx      // Filter tabs
├── NotificationToast.jsx        // Toast notification
└── NotificationPreferences.jsx  // Settings
```

---

## 8️⃣ WORKFLOW VISUALIZATION

### 🎯 Mục đích
Hiển thị trực quan quy trình duyệt giáo trình (workflow), giúp user biết giáo trình đang ở bước nào, ai đang xử lý, bao lâu nữa hoàn thành.

### 📋 Chức năng chi tiết

#### A. Workflow Stepper
**Vị trí:** Thêm component trong `SyllabusDetailPage.jsx` (tất cả portals)

**Features:**

1. **Horizontal Stepper**
   - Steps:
     1. ✏️ Draft (Lecturer tạo)
     2. 🤝 Collaborative Review (Lecturer review)
     3. 👤 HOD Review
     4. 📚 Academic Affairs Review
     5. 🎓 Rector Approval
     6. ✅ Published

2. **Step States**
   - ⚪ Not Started: Gray
   - 🔵 In Progress: Blue + Pulsing
   - ✅ Completed: Green + Checkmark
   - ❌ Rejected: Red + X
   - ⏸️ On Hold: Yellow + Pause icon

3. **Step Details (Hover)**
   - Tooltip shows:
     - Step name
     - Current assignee: "Dr. Nguyen Van A"
     - Started date: "Jan 25, 2026"
     - Expected completion: "Jan 30, 2026"
     - Status: "Waiting for approval"

4. **Timeline View (Alternative)**
   - Vertical timeline
   - Each step shows:
     - Date & time
     - Actor (who did it)
     - Action (created, submitted, approved, rejected)
     - Comment (if any)
   - Icon on left, content on right

5. **Progress Percentage**
   - Show: "60% completed"
   - Progress bar below stepper

---

#### B. Workflow History
**Vị trí:** Tab "History" trong Syllabus Detail

**Features:**

1. **Activity Log**
   - Table: Date | User | Action | Comment
   - Example:
     ```
     Jan 31, 10:30 | Dr. A | Submitted for HOD review | -
     Jan 30, 14:00 | Dr. B | Added comment | "Please revise section 3"
     Jan 29, 09:00 | Dr. C | Completed review | -
     Jan 28, 16:00 | Lecturer X | Created syllabus | Version 1.0
     ```

2. **Filter History**
   - By user
   - By action type
   - By date range

3. **Export History**
   - Download as PDF report
   - Audit trail for compliance

---

#### C. Admin Workflow Dashboard
**Vị trí:** `modules/admin/pages/WorkflowDashboard.jsx`

**Features:**

1. **Overview Stats**
   - Total syllabi in workflow
   - By status: Draft, In Review, Pending Approval, Approved
   - Average processing time per step
   - Bottleneck detection (which step takes longest)

2. **Workflow Visualization (All Syllabi)**
   - Kanban board:
     - Column 1: Draft
     - Column 2: Collaborative Review
     - Column 3: HOD Review
     - Column 4: AA Review
     - Column 5: Rector Approval
     - Column 6: Published
   - Drag & drop cards (manual override)
   - Card shows: Syllabus name, lecturer, days in current step

3. **SLA Monitoring**
   - Highlight syllabi exceeding SLA (e.g., > 7 days in one step)
   - Send alerts to admins
   - Escalation actions

---

### 🔧 Backend Requirements

**New Table:**
```sql
workflow_instances (
  id, syllabus_id, 
  current_step, status,
  created_at, updated_at
)

workflow_steps (
  id, name, sequence_order,
  assigned_role, 
  sla_days
)

workflow_history (
  id, workflow_instance_id,
  step_id, actor_id,
  action (submitted/approved/rejected/commented),
  comment, timestamp
)
```

**New APIs:**
```
GET    /api/workflows/:syllabusId/status
GET    /api/workflows/:syllabusId/history
GET    /api/workflows/dashboard-stats
PUT    /api/workflows/:id/transition (move to next step)
POST   /api/workflows/:id/comment
```

---

### 🎨 UI Components

```jsx
components/workflow/
├── WorkflowStepper.jsx          // Horizontal stepper
├── WorkflowTimeline.jsx         // Vertical timeline
├── WorkflowStep.jsx             // Single step component
├── StepTooltip.jsx              // Hover tooltip
├── WorkflowProgress.jsx         // Progress bar
├── ActivityLog.jsx              // History table
├── WorkflowKanban.jsx           // Kanban board
└── SLAAlert.jsx                 // SLA warning badge
```

**Libraries:**
- `react-step-progress-bar` (for stepper)
- `react-beautiful-dnd` (for kanban drag-drop)
- `react-vertical-timeline-component` (for timeline)

---

## 🎯 SUMMARY: PRIORITIES

### 🔴 MUST HAVE (Demo & Grading)
1. **Collaborative Review** → Core requirement
2. **Student Feedback** → Core requirement
3. **AI Summary Display** → Show AI integration
4. **CLO-PLO Matrix** → Academic requirement
5. **Subject Tree** → Academic requirement

### 🟡 SHOULD HAVE (Bonus Points)
6. **Notification Center** → Improves UX
7. **Workflow Visualization** → Shows system maturity

### 🟢 NICE TO HAVE (Future)
8. **Mobile App** → Significant effort, do later

---

## 📅 ESTIMATED TIMELINE

| Feature | Complexity | Estimated Time | Priority |
|---------|-----------|----------------|----------|
| Collaborative Review | High | 5-7 days | 🔴 P1 |
| Student Feedback | Medium | 2-3 days | 🔴 P1 |
| AI Summary Display | Medium | 2-3 days | 🔴 P1 |
| Subject Tree | High | 4-5 days | 🔴 P1 |
| CLO-PLO Matrix | Medium | 3-4 days | 🔴 P1 |
| Notification Center | High | 4-5 days | 🟡 P2 |
| Workflow Visualization | Medium | 3-4 days | 🟡 P2 |
| Mobile App | Very High | 2-3 weeks | 🟢 P3 |

**Total P1 (Critical):** ~16-22 days (~3-4 weeks)
**Total P1+P2:** ~23-31 days (~4-6 weeks)

---

*Document created: January 31, 2026*
