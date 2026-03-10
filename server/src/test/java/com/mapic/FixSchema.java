package com.mapic;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixSchema {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/mapic_db";
        String user = "postgres";
        String password = "01218552666aE@";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Starting schema fixes...");
            
            // Drop tables that were UUID but are now BIGINT
            stmt.execute("DROP TABLE IF EXISTS user_feedback CASCADE");
            stmt.execute("DROP TABLE IF EXISTS user_interactions CASCADE");
            stmt.execute("DROP TABLE IF EXISTS filter_presets CASCADE");
            stmt.execute("DROP TABLE IF EXISTS hashtags CASCADE");
            stmt.execute("DROP TABLE IF EXISTS post_hashtags CASCADE");
            stmt.execute("DROP TABLE IF EXISTS proximity_notifications CASCADE");
            
            System.out.println("Dropped mismatched bigint tables.");

            // Fix avatar_frames string vs uuid and legacy columns
            try {
                stmt.execute("ALTER TABLE user_avatar_frames DROP CONSTRAINT IF EXISTS fk_user_avatar_frames_frame CASCADE");
                stmt.execute("ALTER TABLE avatar_frames ALTER COLUMN id TYPE VARCHAR(50) USING id::text");
                stmt.execute("ALTER TABLE user_avatar_frames ALTER COLUMN frame_id TYPE VARCHAR(50) USING frame_id::text");
                stmt.execute("ALTER TABLE user_avatar_frames ADD CONSTRAINT fk_user_avatar_frames_frame FOREIGN KEY (frame_id) REFERENCES avatar_frames(id) ON DELETE CASCADE");
                stmt.execute("ALTER TABLE avatar_frames DROP COLUMN IF EXISTS image_url CASCADE");
                stmt.execute("ALTER TABLE avatar_frames DROP COLUMN IF EXISTS unlock_value CASCADE");
                System.out.println("Successfully altered avatar frames IDs and dropped legacy columns.");
            } catch (Exception e) {
                System.out.println("Could not alter avatar frames: " + e.getMessage());
            }

            System.out.println("Done.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
