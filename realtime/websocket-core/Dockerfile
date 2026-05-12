FROM gcc:14

WORKDIR /app

RUN apt-get update && apt-get install -y cmake

COPY . .

RUN cmake . && make

CMD ["./websocket-core"]
