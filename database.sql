
USE graduation;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS portfolio;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS photographers;
DROP TABLE IF EXISTS feed_posts;
DROP TABLE IF EXISTS cms_pages;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','photographer') NOT NULL DEFAULT 'photographer',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photographers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  area VARCHAR(100) DEFAULT '',
  avatar VARCHAR(500) DEFAULT '',
  cover VARCHAR(500) DEFAULT '',
  bio TEXT,
  styles VARCHAR(500) DEFAULT '',
  rating DECIMAL(2,1) DEFAULT 5.0,
  shoots INT DEFAULT 0,
  price_from DECIMAL(12,0) DEFAULT 0,
  verified TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(12,0) NOT NULL DEFAULT 0,
  duration VARCHAR(100) DEFAULT '',
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
);

CREATE TABLE portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NULL,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  area VARCHAR(150) NOT NULL,
  shoot_date DATE NULL,
  people INT DEFAULT 1,
  package_name VARCHAR(150) DEFAULT '',
  message TEXT,
  type ENUM('hire','contact') NOT NULL DEFAULT 'hire',
  status ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE SET NULL
);

CREATE TABLE feed_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) DEFAULT '',
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  photographer_name VARCHAR(150) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cms_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Demo hashes correspond to admin123 / mike123 using bcryptjs.
INSERT INTO users (username,password_hash,role) VALUES
('admin','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','admin'),
('mike','$2a$10$7EqJtq98hPqEX7fNZaFWoO4uR8VxJ9u7QWwQf7vQJ2K4u7J3m8w5K','photographer');

INSERT INTO photographers (user_id,name,area,avatar,cover,bio,styles,rating,shoots,price_from,verified)
VALUES
(2,'Mike','Hà Nội','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600','https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
'Mình chuyên chụp kỷ yếu, chân dung và fashion. Ưu tiên khoảnh khắc tự nhiên, màu ảnh điện ảnh.',
'Moody Portrait · Thanh xuân · Fashion',4.7,130,5000000,1),
(NULL,'Linh','TP. Hồ Chí Minh','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600','https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=1600',
'Portrait và couple với phong cách sáng, tự nhiên.','Natural · Couple · Graduation',4.9,86,3500000,1),
(NULL,'Nam Studio','Đà Nẵng','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600','https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600',
'Chụp nhóm, sự kiện và kỷ yếu tại Đà Nẵng.','Clean · Group · Event',4.8,112,4200000,1);

INSERT INTO packages (photographer_id,name,description,price,duration) VALUES
(1,'Kỷ yếu tiêu chuẩn','1 photographer · 80 ảnh chỉnh màu',5000000,'4 giờ'),
(1,'Kỷ yếu premium','2 photographer · 150 ảnh · album',8000000,'6 giờ'),
(2,'Couple','60 ảnh chỉnh màu',3500000,'3 giờ');

INSERT INTO portfolio (photographer_id,image_url,caption) VALUES
(1,'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000','Thanh xuân'),
(1,'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000','Bạn bè'),
(1,'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1000','Portrait'),
(2,'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000','Couple'),
(2,'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000','Natural');

INSERT INTO feed_posts (title,image_url,caption,photographer_name) VALUES
('Một ngày thanh xuân','https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200','Những khoảnh khắc đáng nhớ của tuổi trẻ.','Mike'),
('Kỷ yếu ngoài trời','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200','Ánh sáng tự nhiên và nụ cười tự nhiên.','Linh'),
('Portrait tối giản','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200','Một góc chân dung đơn giản.','Nam Studio');

INSERT INTO cms_pages(slug,title,content) VALUES
('guide','Hướng dẫn đặt lịch','1. Chọn photographer phù hợp.\\n2. Xem portfolio và gói chụp.\\n3. Nhấn Đặt lịch và điền thông tin.\\n4. Photographer liên hệ xác nhận.'),
('protection','Bảo vệ khách','Thông tin liên hệ của khách chỉ được dùng để xử lý yêu cầu đặt lịch. Không chia sẻ trái phép. Khách có thể yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân.');
