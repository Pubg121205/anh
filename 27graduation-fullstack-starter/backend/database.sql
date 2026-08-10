CREATE DATABASE IF NOT EXISTS graduation
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE graduation;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS feed_posts;
DROP TABLE IF EXISTS page_sections;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS portfolio_images;
DROP TABLE IF EXISTS photographer_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','photographer') NOT NULL DEFAULT 'photographer',
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE photographer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  avatar VARCHAR(500),
  cover_image VARCHAR(500),
  location VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  shooting_count INT DEFAULT 0,
  response_time VARCHAR(50) DEFAULT '~75 phút',
  response_rate INT DEFAULT 0,
  price_from DECIMAL(15,2) DEFAULT 0,
  bio TEXT,
  style VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE portfolio_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  duration VARCHAR(100),
  max_people INT DEFAULT 1,
  location VARCHAR(255),
  status ENUM('active','hidden') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NULL,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  area VARCHAR(150) NOT NULL,
  type ENUM('booking','contact') NOT NULL DEFAULT 'booking',
  package_id INT NULL,
  shooting_date DATE NULL,
  people_count INT DEFAULT 1,
  message TEXT,
  status ENUM('new','contacted','confirmed','completed','cancelled') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographer_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
);

CREATE TABLE feed_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  category VARCHAR(100),
  location VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographer_profiles(id) ON DELETE SET NULL
);

CREATE TABLE page_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_slug VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  content TEXT,
  icon VARCHAR(50),
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_page_section (page_slug, section_key)
);

INSERT INTO users (username,email,password,role,status) VALUES
('admin','admin@27graduation.local','$2b$10$4nL3J7V9w2s6xv6M7n9MNeJ1iQ8y1fYkR5b8bQx7Z1eP9s4Vq3n6K','admin','active'),
('mike','mike@27graduation.local','$2b$10$6n7V9fJ0pQmN8x3cV2zY3eH9pQ2kM1sR6aB5cD4eF7gH8jK9lM0nO','photographer','active');

INSERT INTO photographer_profiles
(user_id,name,avatar,cover_image,location,rating,review_count,shooting_count,response_time,response_rate,price_from,bio,style,verified)
VALUES
(2,'Mike',
'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600',
'Hà Nội',4.7,130,130,'~75 phút',97,5000000,
'Photographer chuyên portrait, thanh xuân và fashion. Phong cách nhẹ nhàng, màu ảnh trong trẻo.',
'Moody Portrait · Thanh xuân · Fashion',1);

INSERT INTO portfolio_images (photographer_id,image_url,title,sort_order,is_featured) VALUES
(1,'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900','Portrait',1,1),
(1,'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900','Graduation',2,1),
(1,'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900','Fashion',3,0),
(1,'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900','Portrait',4,0);

INSERT INTO packages (photographer_id,name,description,price,duration,max_people,location)
VALUES
(1,'Portrait cơ bản','1 giờ chụp, 20 ảnh chỉnh màu.',5000000,'1 giờ',1,'Hà Nội'),
(1,'Kỷ yếu nhóm','3 giờ chụp, tối đa 5 người.',8000000,'3 giờ',5,'Hà Nội');

INSERT INTO feed_posts (photographer_id,image_url,caption,category,location)
VALUES
(1,'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000','Một buổi chiều thật đẹp.','Kỷ yếu','Hà Nội'),
(1,'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000','Thanh xuân và nắng.','Portrait','Hà Nội'),
(1,'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000','Fashion portrait.','Fashion','Hà Nội');

INSERT INTO page_sections(page_slug,section_key,title,subtitle,content,icon,sort_order) VALUES
('huong-dan','step_1','Chọn photographer hợp gu','Cứ thong thả','Vào Tìm photographer — lọc theo hạng, mức giá, đánh giá; bấm vào thẻ để xem nhanh ngay tại chỗ.','1',1),
('huong-dan','step_2','Chốt gói & giá — minh bạch trước tiền','Bước 1 của đặt lịch','Chọn gói chụp. Kéo thanh số người nếu chụp nhóm — giá nhóm tính tự động.','2',2),
('huong-dan','step_3','Chọn ngày & ca trên lịch','Thấy ngay ngày còn trống','Lịch hiển thị ngày trống và ca còn chỗ của photographer bạn chọn.','3',3),
('bao-ve-khach','protection_1','Bảo vệ thanh toán','','Tiền cọc được giữ tạm tại nền tảng cho tới khi buổi chụp hoàn tất hoặc có vấn đề cần xử lý.','🔒',1),
('bao-ve-khach','protection_2','Photographer đã kiểm duyệt','','Mọi hồ sơ đều được duyệt portfolio và cam kết chất lượng trước khi hiển thị.','✓',2),
('bao-ve-khach','protection_3','Đánh giá thật','','Chỉ khách đã chụp mới đánh giá — giúp bạn chọn đúng người.','★',3);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at);
CREATE INDEX idx_feed_created ON feed_posts(created_at);
