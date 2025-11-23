-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_owner boolean;
  user_role text;
  user_full_name text;
  meta_business_name text;
  meta_invite_code text;
  new_business_id uuid;
  found_business_id uuid;
  generated_code text;
begin
  -- Extract metadata
  user_role := new.raw_user_meta_data->>'role';
  user_full_name := new.raw_user_meta_data->>'full_name';
  meta_business_name := new.raw_user_meta_data->>'business_name';
  meta_invite_code := new.raw_user_meta_data->>'invite_code';

  -- 1. Create Profile
  insert into public.profiles (id, full_name, role, email)
  values (new.id, user_full_name, user_role, new.email);

  -- 2. Handle Role Specific Logic
  if user_role = 'owner' then
    -- Generate simple random invite code (6 chars)
    generated_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Create Business
    insert into public.businesses (name, owner_id, invite_code)
    values (meta_business_name, new.id, generated_code)
    returning id into new_business_id;

    -- Link Profile to Business
    update public.profiles
    set business_id = new_business_id
    where id = new.id;

  elsif user_role = 'employee' then
    -- Find Business by Invite Code
    select id into found_business_id
    from public.businesses
    where invite_code = meta_invite_code;

    if found_business_id is not null then
      -- Link Profile to Business
      update public.profiles
      set business_id = found_business_id
      where id = new.id;
    else
      -- Optional: Handle invalid code? 
      -- The trigger cannot easily return an error to the API client in a way that shows in the UI nicely,
      -- but raising an exception will fail the signup.
      raise exception 'Invalid invite code';
    end if;
  end if;

  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
