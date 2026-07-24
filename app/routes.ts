import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("catalogo", "routes/catalogo.tsx"),
	route("conta", "routes/conta.tsx"),
	route("admin", "routes/admin.tsx"),
	route("redefinir-senha", "routes/redefinir-senha.tsx"),
	route("api/cliente", "routes/api.cliente.ts"),
	route("api/pedido", "routes/api.pedido.ts"),
	route("api/produto", "routes/api.produto.ts"),
	route("api/pagarme/webhook", "routes/api.pagarme-webhook.ts"),
] satisfies RouteConfig;
