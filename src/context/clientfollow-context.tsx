"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Client,
  FollowUpItem,
  CalendarTouchpoint,
  initialClients,
  initialFollowUps,
  calendarTouchpoints as initialCalendarTouchpoints,
} from "@/lib/clientfollow-data";

interface ClientFollowContextType {
  clients: Client[];
  followUps: FollowUpItem[];
  touchpoints: CalendarTouchpoint[];
  addClient: (client: Omit<Client, "id">) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addFollowUp: (item: Omit<FollowUpItem, "id">) => FollowUpItem;
  toggleFollowUpComplete: (id: string) => void;
  deleteFollowUp: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ClientFollowContext = createContext<ClientFollowContextType | undefined>(undefined);

export function ClientFollowProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(initialFollowUps);
  const [touchpoints, setTouchpoints] = useState<CalendarTouchpoint[]>(initialCalendarTouchpoints);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync to local storage for realistic client-side reactivity without external DB calls
  useEffect(() => {
    try {
      const savedClients = localStorage.getItem("clientfollow_clients");
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
      const savedFollowUps = localStorage.getItem("clientfollow_followups");
      if (savedFollowUps) {
        setFollowUps(JSON.parse(savedFollowUps));
      }
    } catch {
      // ignore SSR or storage exceptions
    }
  }, []);

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    try {
      localStorage.setItem("clientfollow_clients", JSON.stringify(newClients));
    } catch {}
  };

  const saveFollowUps = (newFollowUps: FollowUpItem[]) => {
    setFollowUps(newFollowUps);
    try {
      localStorage.setItem("clientfollow_followups", JSON.stringify(newFollowUps));
    } catch {}
  };

  const addClient = (clientData: Omit<Client, "id">) => {
    const newClient: Client = {
      ...clientData,
      id: "c_" + Date.now(),
    };
    const updated = [newClient, ...clients];
    saveClients(updated);

    // Also auto-schedule a follow-up if applicable
    if (newClient.nextFollowUpDate) {
      const newFollowUp: FollowUpItem = {
        id: "fu_" + Date.now(),
        clientId: newClient.id,
        clientName: newClient.name,
        clientCompany: newClient.company,
        clientAvatar: newClient.avatarUrl,
        type: newClient.nextFollowUpType,
        title: `${newClient.nextFollowUpType} with ${newClient.name}`,
        context: newClient.notes || "Initial touchpoint cadence set",
        dueDate: newClient.nextFollowUpDate,
        dueTime: "Scheduled 10:00 AM",
        urgency: "upcoming",
        dealValue: newClient.monthlyValue,
        recommendedChannel: "email",
        cadenceRule: `Every ${newClient.cadenceDays} days`,
        completed: false,
      };
      saveFollowUps([newFollowUp, ...followUps]);
    }

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    saveClients(updated);
    const updatedFollowUps = followUps.filter((f) => f.clientId !== id);
    saveFollowUps(updatedFollowUps);
  };

  const addFollowUp = (item: Omit<FollowUpItem, "id">) => {
    const newFollowUp: FollowUpItem = {
      ...item,
      id: "fu_" + Date.now(),
    };
    const updated = [newFollowUp, ...followUps];
    saveFollowUps(updated);
    return newFollowUp;
  };

  const toggleFollowUpComplete = (id: string) => {
    const updated = followUps.map((f) =>
      f.id === id
        ? {
            ...f,
            completed: !f.completed,
            urgency: (!f.completed ? "completed" : "due_today") as FollowUpItem["urgency"],
          }
        : f
    );
    saveFollowUps(updated);
  };

  const deleteFollowUp = (id: string) => {
    const updated = followUps.filter((f) => f.id !== id);
    saveFollowUps(updated);
  };

  return (
    <ClientFollowContext.Provider
      value={{
        clients,
        followUps,
        touchpoints,
        addClient,
        updateClient,
        deleteClient,
        addFollowUp,
        toggleFollowUpComplete,
        deleteFollowUp,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </ClientFollowContext.Provider>
  );
}

export function useClientFollow() {
  const context = useContext(ClientFollowContext);
  if (!context) {
    throw new Error("useClientFollow must be used within a ClientFollowProvider");
  }
  return context;
}
