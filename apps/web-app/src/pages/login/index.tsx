import { createFileRoute } from "@tanstack/react-router";
import { ClassicLogin } from "./-components/classic-login";
// import { DialogLogin } from "./-components/dialog-login";

export const Route = createFileRoute("/login/")({
	component: LoginPage,
});

function LoginPage() {
	return <ClassicLogin />;
}
