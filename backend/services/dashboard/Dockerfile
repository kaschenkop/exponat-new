FROM golang:1.23-alpine AS build
WORKDIR /src
COPY services/dashboard/go.mod services/dashboard/go.sum ./services/dashboard/
RUN cd services/dashboard && go mod download
COPY services/dashboard ./services/dashboard
WORKDIR /src/services/dashboard
RUN CGO_ENABLED=0 go build -o /out/dashboard ./cmd

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/dashboard /usr/local/bin/dashboard
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/dashboard"]
