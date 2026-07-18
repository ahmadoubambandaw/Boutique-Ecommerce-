import { getAdminSession } from "@/lib/auth/admin-actions";
import { isDbConfigured } from "@/lib/db/client";
import { AccountForm } from "@/components/admin/account-form";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getAdminSession();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon compte</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Modifiez votre adresse e-mail et votre mot de passe de connexion.
        </p>
      </div>

      {!isDbConfigured() || !session ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Connectez-vous à l&apos;administration pour gérer votre compte.
        </div>
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] p-6">
          <AccountForm email={session.email} />
        </div>
      )}
    </div>
  );
}
