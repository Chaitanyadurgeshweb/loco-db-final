"use client";
import { login } from "@/app/admin/actions"; import AuthForm from "@/components/auth/AuthForm";
export default function LoginForm() { return <AuthForm action={login} variant="admin" />; }
