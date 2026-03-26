"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { email, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Account</h1>

      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Need help? Reach out to us at{" "}
              <a
                href="mailto:hello@hi-kaizen.com"
                className="text-primary hover:underline"
              >
                hello@hi-kaizen.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Separator />

        <Button variant="destructive" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
