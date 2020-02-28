const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "../../proto/users.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const client = new protoDescriptor.Users.UsersService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);
module.exports = client;
