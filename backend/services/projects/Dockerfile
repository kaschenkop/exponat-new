FROM golang:1.23-alpine AS build
WORKDIR /src
COPY services/projects/go.mod services/projects/go.sum ./services/projects/
RUN cd services/projects && go mod download
COPY services/projects ./services/projects
WORKDIR /src/services/projects
RUN CGO_ENABLED=0 go build -o /out/projects ./cmd

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/projects /usr/local/bin/projects
EXPOSE 8081
ENV PORT=8081
ENTRYPOINT ["/usr/local/bin/projects"]
