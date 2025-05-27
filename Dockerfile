# 1. nginx 알파인 이미지를 베이스로 사용
FROM nginx:alpine

# 2. 현재 폴더의 정적 파일들을 nginx 기본 루트 디렉터리에 복사
COPY . /usr/share/nginx/html

# 3. 컨테이너가 80번 포트를 노출하도록 설정
EXPOSE 80