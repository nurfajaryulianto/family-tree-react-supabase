-- Family Tree Database Schema for Real-time Collaboration
-- This file creates all necessary tables, enables RLS, and sets up real-time functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE relationship_type AS ENUM ('parent', 'child', 'spouse', 'sibling');
CREATE TYPE notification_type AS ENUM ('member_added', 'member_updated', 'relationship_added', 'tree_updated', 'user_joined');

-- Trees table - Family tree projects
CREATE TABLE IF NOT EXISTS trees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members table
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_name TEXT,
    nickname TEXT,
    birth_date DATE,
    birth_location TEXT,
    death_date DATE,
    death_location TEXT,
    is_deceased BOOLEAN DEFAULT FALSE,
    gender TEXT,
    avatar_url TEXT,
    bio TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships table
CREATE TABLE IF NOT EXISTS relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type relationship_type NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_member_id, to_member_id, type)
);

-- Tree collaborators table
CREATE TABLE IF NOT EXISTS tree_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tree_id, user_id)
);

-- Activity feed for real-time updates
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presence tracking for real-time collaboration
CREATE TABLE IF NOT EXISTS presence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    cursor_position JSONB DEFAULT '{}',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    online_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tree_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Trees
CREATE POLICY "Users can view their own trees"
    ON trees FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT tree_id FROM tree_collaborators
            WHERE user_id = auth.uid()
        ) OR
        is_public = true
    );

CREATE POLICY "Users can insert their own trees"
    ON trees FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Tree owners can update their trees"
    ON trees FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Tree owners can delete their trees"
    ON trees FOR DELETE
    USING (owner_id = auth.uid());

-- RLS Policies for Members
CREATE POLICY "Users can view members of accessible trees"
    ON members FOR SELECT
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid()
            ) OR
            is_public = true
        )
    );

CREATE POLICY "Tree owners and editors can insert members"
    ON members FOR INSERT
    WITH CHECK (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
            )
        )
    );

CREATE POLICY "Tree owners and editors can update members"
    ON members FOR UPDATE
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
            )
        )
    );

CREATE POLICY "Tree owners and editors can delete members"
    ON members FOR DELETE
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
            )
        )
    );

-- RLS Policies for Relationships
CREATE POLICY "Users can view relationships of accessible trees"
    ON relationships FOR SELECT
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid()
            ) OR
            is_public = true
        )
    );

CREATE POLICY "Tree owners and editors can insert relationships"
    ON relationships FOR INSERT
    WITH CHECK (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
            )
        )
    );

CREATE POLICY "Tree owners and editors can update relationships"
    ON relationships FOR UPDATE
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
            )
        )
    );

CREATE POLICY "Tree owners and editors can delete relationships"
    ON relationships FOR DELETE
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
            )
        )
    );

-- RLS Policies for Tree Collaborators
CREATE POLICY "Users can view collaborators of their trees"
    ON tree_collaborators FOR SELECT
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE owner_id = auth.uid()
        ) OR
        user_id = auth.uid()
    );

CREATE POLICY "Tree owners can manage collaborators"
    ON tree_collaborators FOR ALL
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own collaborations"
    ON tree_collaborators FOR SELECT
    USING (user_id = auth.uid());

-- RLS Policies for Activities
CREATE POLICY "Users can view activities of accessible trees"
    ON activities FOR SELECT
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid()
            ) OR
            is_public = true
        )
    );

CREATE POLICY "Tree members can insert activities"
    ON activities FOR INSERT
    WITH CHECK (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid()
            )
        ) AND
        user_id = auth.uid()
    );

-- RLS Policies for Presence
CREATE POLICY "Users can view presence of accessible trees"
    ON presence FOR SELECT
    USING (
        tree_id IN (
            SELECT id FROM trees WHERE
            owner_id = auth.uid() OR
            id IN (
                SELECT tree_id FROM tree_collaborators
                WHERE user_id = auth.uid()
            ) OR
            is_public = true
        )
    );

CREATE POLICY "Users can manage their own presence"
    ON presence FOR ALL
    USING (user_id = auth.uid());

-- Enable Realtime for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE trees;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE relationships;
ALTER PUBLICATION supabase_realtime ADD TABLE tree_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;

-- Functions for automatic activity logging
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activities (tree_id, user_id, type, title, description, metadata)
        VALUES (
            COALESCE(NEW.tree_id, NEW.id),
            auth.uid(),
            CASE TG_TABLE_NAME
                WHEN 'members' THEN 'member_added'
                WHEN 'relationships' THEN 'relationship_added'
                WHEN 'trees' THEN 'tree_updated'
                WHEN 'tree_collaborators' THEN 'user_joined'
                ELSE 'tree_updated'
            END,
            CASE TG_TABLE_NAME
                WHEN 'members' THEN 'New family member added'
                WHEN 'relationships' THEN 'New relationship created'
                WHEN 'trees' THEN 'Tree updated'
                WHEN 'tree_collaborators' THEN 'New collaborator joined'
                ELSE 'Tree updated'
            END,
            CASE TG_TABLE_NAME
                WHEN 'members' THEN format('%s %s was added to the family tree', NEW.first_name, NEW.last_name)
                WHEN 'relationships' THEN format('Relationship created between members')
                WHEN 'trees' THEN format('Tree "%s" was updated', NEW.name)
                WHEN 'tree_collaborators' THEN format('New collaborator joined the tree')
                ELSE 'Tree updated'
            END,
            json_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'new_data', row_to_json(NEW)
            )
        );
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        INSERT INTO activities (tree_id, user_id, type, title, description, metadata)
        VALUES (
            COALESCE(NEW.tree_id, NEW.id),
            auth.uid(),
            CASE TG_TABLE_NAME
                WHEN 'members' THEN 'member_updated'
                WHEN 'trees' THEN 'tree_updated'
                ELSE 'tree_updated'
            END,
            CASE TG_TABLE_NAME
                WHEN 'members' THEN 'Family member updated'
                WHEN 'trees' THEN 'Tree updated'
                ELSE 'Tree updated'
            END,
            CASE TG_TABLE_NAME
                WHEN 'members' THEN format('%s %s was updated', NEW.first_name, NEW.last_name)
                WHEN 'trees' THEN format('Tree "%s" was updated', NEW.name)
                ELSE 'Tree updated'
            END,
            json_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'old_data', row_to_json(OLD),
                'new_data', row_to_json(NEW)
            )
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_member_changes
    AFTER INSERT OR UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_relationship_changes
    AFTER INSERT ON relationships
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_tree_changes
    AFTER INSERT OR UPDATE ON trees
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_collaborator_changes
    AFTER INSERT ON tree_collaborators
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function to update presence timestamp
CREATE OR REPLACE FUNCTION update_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for presence updates
CREATE TRIGGER update_presence_timestamp_trigger
    BEFORE UPDATE ON presence
    FOR EACH ROW EXECUTE FUNCTION update_presence_timestamp();

-- Create indexes for performance
CREATE INDEX idx_trees_owner_id ON trees(owner_id);
CREATE INDEX idx_members_tree_id ON members(tree_id);
CREATE INDEX idx_relationships_tree_id ON relationships(tree_id);
CREATE INDEX idx_tree_collaborators_tree_id ON tree_collaborators(tree_id);
CREATE INDEX idx_tree_collaborators_user_id ON tree_collaborators(user_id);
CREATE INDEX idx_activities_tree_id ON activities(tree_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_presence_tree_id ON presence(tree_id);
CREATE INDEX idx_presence_user_id ON presence(user_id);
CREATE INDEX idx_presence_last_seen ON presence(last_seen);

-- Function to clean up old presence records
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS void AS $$
BEGIN
    DELETE FROM presence
    WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean up old presence every 5 minutes
-- Note: This requires pg_cron extension which may not be available in Supabase
-- You can alternatively call this function from a scheduled job in your application