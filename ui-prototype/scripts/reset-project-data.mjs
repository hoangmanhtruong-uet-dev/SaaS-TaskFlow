import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase URL or Service Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function resetProjectData() {
  console.log("🧹 Resetting project tasks & demo data in Supabase...\n");

  try {
    // 1. Delete dependent task data
    console.log("   - Cleaning attachments...");
    await supabase.from("attachments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("   - Cleaning comments...");
    await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("   - Cleaning task checklist items...");
    await supabase.from("task_checklist_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("   - Cleaning task assignees...");
    await supabase.from("task_assignees").delete().neq("task_id", "00000000-0000-0000-0000-000000000000");

    console.log("   - Cleaning tasks...");
    await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("   - Cleaning activity events & notifications...");
    await supabase.from("activity_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Fetch existing workspace & creator membership
    const { data: workspaces } = await supabase.from("workspaces").select("id").limit(1);
    const workspaceId = workspaces?.[0]?.id;

    if (!workspaceId) {
      console.log("⚠️ No workspace found. Database has been cleaned!");
      return;
    }

    const { data: memberships } = await supabase
      .from("memberships")
      .select("id")
      .eq("workspace_id", workspaceId)
      .limit(1);
    const membershipId = memberships?.[0]?.id;

    // 3. Ensure a default project exists
    let { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!project) {
      console.log("   - Creating default project...");
      const { data: newProj } = await supabase
        .from("projects")
        .insert({
          workspace_id: workspaceId,
          name: "Dự án SaaS Quản Lý Công Việc",
          description: "Dự án quản lý tính năng & nhiệm vụ phát triển phần mềm SaaS.",
          visibility: "WORKSPACE",
          lead_membership_id: membershipId,
        })
        .select()
        .single();
      project = newProj;
    }

    if (!project) {
      console.log("❌ Failed to create or find project.");
      return;
    }

    // 4. Ensure a board exists
    let { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("project_id", project.id)
      .maybeSingle();

    if (!board) {
      console.log("   - Creating default board...");
      const { data: newBoard } = await supabase
        .from("boards")
        .insert({
          workspace_id: workspaceId,
          project_id: project.id,
          name: "Board Công Việc Chính",
        })
        .select()
        .single();
      board = newBoard;
    }

    // 5. Ensure columns exist
    const { data: existingCols } = await supabase
      .from("board_columns")
      .select("id, name")
      .eq("board_id", board.id);

    let cols = existingCols || [];
    if (cols.length === 0) {
      console.log("   - Creating default board columns...");
      const colDefs = [
        { name: "Cần làm", position: 0 },
        { name: "Đang làm", position: 1 },
        { name: "Đang đánh giá", position: 2 },
        { name: "Hoàn thành", position: 3 },
      ];
      const { data: insertedCols } = await supabase
        .from("board_columns")
        .insert(
          colDefs.map((c) => ({
            workspace_id: workspaceId,
            board_id: board.id,
            name: c.name,
            position: c.position,
          }))
        )
        .select();
      cols = insertedCols || [];
    }

    const todoCol = cols.find((c) => c.name.includes("Cần làm")) || cols[0];
    const inProgressCol = cols.find((c) => c.name.includes("Đang làm")) || cols[1] || cols[0];
    const doneCol = cols.find((c) => c.name.includes("Hoàn thành")) || cols[cols.length - 1];

    // 6. Seed sample tasks into database with real UUIDs
    if (membershipId && todoCol && inProgressCol) {
      console.log("   - Seeding sample tasks...");
      const sampleTasks = [
        {
          workspace_id: workspaceId,
          project_id: project.id,
          board_id: board.id,
          column_id: todoCol.id,
          creator_membership_id: membershipId,
          title: "Thiết kế hệ thống Design Tokens",
          description: "Đồng bộ hóa các giá trị màu sắc, typography và spacing cho giao diện mới.",
          priority: "HIGH",
          position: 0,
        },
        {
          workspace_id: workspaceId,
          project_id: project.id,
          board_id: board.id,
          column_id: todoCol.id,
          creator_membership_id: membershipId,
          title: "Nghiên cứu kiến trúc micro-frontend",
          description: "Đánh giá Module Federation và các giải pháp tích hợp cho dashboard.",
          priority: "MEDIUM",
          position: 1,
        },
        {
          workspace_id: workspaceId,
          project_id: project.id,
          board_id: board.id,
          column_id: inProgressCol.id,
          creator_membership_id: membershipId,
          title: "Tích hợp upload Cloudinary",
          description: "Tải ảnh avatar trực tiếp lên CDN Cloudinary và cập nhật profile.",
          priority: "HIGH",
          position: 0,
        },
        {
          workspace_id: workspaceId,
          project_id: project.id,
          board_id: board.id,
          column_id: doneCol ? doneCol.id : inProgressCol.id,
          creator_membership_id: membershipId,
          title: "Khởi tạo hệ thống Database & Auth",
          description: "Thiết lập Supabase RLS policies và phân quyền workspace.",
          priority: "LOW",
          position: 0,
        },
      ];

      await supabase.from("tasks").insert(sampleTasks);
    }

    console.log("\n✅ Reset database cho dự án thành công! Dữ liệu mẫu đã được khởi tạo mới hoàn toàn.");
  } catch (err) {
    console.error("❌ Reset database thất bại:", err);
  }
}

resetProjectData();
