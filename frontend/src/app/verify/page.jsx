"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, COGNITO } from "../cognito";

export default function Verify() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || "";
  const [status, setStatus] = useState("");
  const router = useRouter();

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: COGNITO.clientId,
          Username: email,
          ConfirmationCode: code
        })
      );
      setStatus("Verification successful! Redirecting to sign-in...");
      router.push('/sign-in');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-6">
          Verify your email
        </h2>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Verification code"
            required
            onChange={e => setCode(e.target.value)}
            className="border px-4 py-2 rounded"
          />

          <button
            disabled={loading}
            className="bg-black text-white py-2 rounded"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        {status && <p className="mt-4 text-green-600">{status}</p>}
        </form>
      </div>
    </main>
  );
}
