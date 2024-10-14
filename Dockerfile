# ใช้ Node.js image เวอร์ชั่นล่าสุด
FROM node:18

# ตั้ง working directory
WORKDIR /app

# คัดลอก package.json และ package-lock.json เพื่อทำการติดตั้ง dependencies
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# ระบุพอร์ตที่ Express.js ใช้งาน
EXPOSE 5000

# รันคำสั่งเริ่มต้นให้กับแอป
CMD ["npm", "start"]
