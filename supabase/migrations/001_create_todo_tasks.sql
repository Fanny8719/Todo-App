-- This SQL was already run on the "First Database" Supabase project.
-- It's kept here so you can read it and re-create the table elsewhere.

create table public.todo_tasks (
  id uuid primary key default gen_random_uuid(),
  -- auth.uid() is the id of whoever is logged in. Supabase fills it in automatically.
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 500),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index todo_tasks_user_id_idx on public.todo_tasks (user_id, created_at desc);

-- Row-level security (RLS). With RLS on and no policies, nobody can see anything.
-- Each policy below opens exactly one door, and only for the row's owner.
alter table public.todo_tasks enable row level security;

create policy "Users can read their own tasks" on public.todo_tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own tasks" on public.todo_tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own tasks" on public.todo_tasks
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own tasks" on public.todo_tasks
  for delete to authenticated using ((select auth.uid()) = user_id);
