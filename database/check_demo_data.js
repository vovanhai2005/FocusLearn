const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const teacherStats = await client.query(
    `
      select
        u.name as teacher,
        count(distinct cl.id)::int as classes,
        count(distinct s.id)::int as students,
        count(distinct co.id)::int as courses,
        count(distinct ce.id)::int as enrollments
      from public.users u
      left join public.classes cl on cl.teacher_id = u.id
      left join public.class_students cs on cs.class_id = cl.id
      left join public.users s on s.id = cs.student_id
      left join public.courses co on co.teacher_id = u.id
      left join public.course_enrollments ce on ce.assigned_by = u.id
      where u.role = $1
      group by u.id, u.name
      order by students desc, courses desc
      limit 8
    `,
    ["teacher"]
  );

  const sampleEnrollments = await client.query(`
    select
      t.name as teacher,
      cl.name as class,
      s.name as student,
      co.title as course,
      ce.progress_percent as progress
    from public.course_enrollments ce
    join public.users s on s.id = ce.student_id
    join public.courses co on co.id = ce.course_id
    join public.classes cl on cl.id = ce.class_id
    join public.users t on t.id = ce.assigned_by
    order by ce.progress_percent desc
    limit 5
  `);

  console.log("Teacher stats");
  console.table(teacherStats.rows);
  console.log("Sample enrollments");
  console.table(sampleEnrollments.rows);

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
