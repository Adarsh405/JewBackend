-- Create table Book(
-- book_id integer PRIMARY key AUTOINCREMENT,
-- title varchar(20),
-- author_name text
-- );
CREATE TABLE user(user_id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE NOT NULL, 
name TEXT UNIQUE NOT NULL,
 password TEXT, 
 gender TEXT, 
 location TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP)