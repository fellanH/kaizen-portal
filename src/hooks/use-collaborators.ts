"use client";

import { useState, useEffect, useCallback } from "react";
import { api, type Collaborator } from "@/lib/api";

export function useCollaborators(projectToken: string | null) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectToken) return;
    setLoading(true);
    try {
      const data = await api.getCollaborators(projectToken);
      setCollaborators(data.collaborators);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [projectToken]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const invite = useCallback(
    async (email: string, role: "owner" | "viewer" = "viewer") => {
      if (!projectToken) return;
      await api.inviteCollaborator(projectToken, email, role);
      await fetch();
    },
    [projectToken, fetch]
  );

  const remove = useCallback(
    async (email: string) => {
      if (!projectToken) return;
      await api.removeCollaborator(projectToken, email);
      setCollaborators((prev) => prev.filter((c) => c.email !== email));
    },
    [projectToken]
  );

  return { collaborators, loading, invite, remove, refresh: fetch };
}
