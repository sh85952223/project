# 1) Node 20 slim-alpine 이미지 사용
FROM node:20-alpine

# 2) 컨테이너 작업 디렉터리
WORKDIR /app

# 3) 종속성 설치를 위한 파일 복사
COPY package*.json ./

# 4) 의존성 설치
RUN npm install

# 5) 소스 전체 복사
COPY . .

# 6) Vite dev 서버 포트
EXPOSE 5173

# 7) 개발 서버 실행
CMD ["npm", "run", "dev"]