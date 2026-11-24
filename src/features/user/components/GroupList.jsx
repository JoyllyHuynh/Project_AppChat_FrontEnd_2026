import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UsersRound, MessageSquare } from "lucide-react";
import "../../../styles/group-list.css";

const KNOWN_KEYS = [
  "webchat_conversations",
  "conversations",
  "chat_conversations",
  "rooms",
  "groups",
];

const readGroupsFromLocalStorage = () => {
  try {
    const candidates = [];

    for (const key of KNOWN_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        candidates.push(...parsed);
      } else if (Array.isArray(parsed?.conversations)) {
        candidates.push(...parsed.conversations);
      }
    }

    if (candidates.length === 0) {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || key === "webchat_theme") continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            candidates.push(...parsed);
          } else if (Array.isArray(parsed?.conversations)) {
            candidates.push(...parsed.conversations);
          }
        } catch {
          // bỏ qua giá trị không phải JSON
        }
      }
    }

    const seen = new Set();
    return candidates
      .filter((item) => item && Number(item.type) === 1)
      .filter((item) => {
        const key = String(item.name || item.id || "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } catch (error) {
    console.error("[GroupList] Failed to read groups from localStorage:", error);
    return [];
  }
};

export const GroupList = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(() => readGroupsFromLocalStorage());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setGroups(readGroupsFromLocalStorage());

    const handleStorageChange = (e) => {
      if (!e.key || e.key !== "webchat_theme") {
        setGroups(readGroupsFromLocalStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredGroups = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const list = !keyword
      ? groups
      : groups.filter((group) => {
          const displayName = String(group.customName || group.name || "").toLowerCase();
          return displayName.includes(keyword);
        });

    return [...list].sort((a, b) => {
      const nameA = String(a.customName || a.name || "");
      const nameB = String(b.customName || b.name || "");
      return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
    });
  }, [groups, searchTerm]);

  const groupedGroups = useMemo(() => {
    return filteredGroups.reduce((acc, group) => {
      const displayName = String(group.customName || group.name || "#").trim();
      const firstChar = displayName.charAt(0).toUpperCase();
      const letter = /[A-ZÀ-Ỹ]/.test(firstChar) ? firstChar : "#";

      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(group);
      return acc;
    }, {});
  }, [filteredGroups]);

  const handleOpenChat = (group) => {
    navigate("/chat", {
      state: {
        selectedConversationName: group.name,
        type: 1,
      },
    });
  };

  return (
    <section className="group-list-page">
      <div className="group-list-header">
        <h2 className="group-list-title">
          Danh sách nhóm và cộng đồng ({filteredGroups.length})
        </h2>

        <div className="group-search-box">
          <input
            type="text"
            placeholder="Tìm nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="group-search-input"
          />
          <Search size={16} className="group-search-icon" />
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="group-list-empty">
          <UsersRound size={36} className="group-list-empty-icon" />
          <p className="group-list-empty-text">
            {searchTerm.trim()
              ? "Không tìm thấy nhóm phù hợp."
              : "Chưa có nhóm hoặc cộng đồng nào."}
          </p>
        </div>
      ) : (
        <div className="group-list-container">
          {Object.keys(groupedGroups)
            .sort((a, b) => {
              if (a === "#") return 1;
              if (b === "#") return -1;
              return a.localeCompare(b, "vi", { sensitivity: "base" });
            })
            .map((letter) => (
              <div key={letter} className="group-group-section">
                <div className="group-group-letter">{letter}</div>

                {groupedGroups[letter].map((group) => {
                  const groupId = group.id || group.name;
                  const displayTitle = group.customName || group.name;

                  return (
                    <div
                      key={groupId}
                      onClick={() => handleOpenChat(group)}
                      className="group-row-item"
                    >
                      <div className="group-card-left">
                        <div className="group-avatar">
                          {group.avatar ? (
                            <img src={group.avatar} alt={displayTitle} />
                          ) : (
                            String(displayTitle || "G").charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="group-meta">
                          <div className="group-name">{displayTitle}</div>
                          <div className="group-sub">
                            {group.memberCount ? `${group.memberCount} thành viên` : "Nhóm chat"}
                          </div>
                        </div>
                      </div>

                      <MessageSquare size={18} className="group-chat-icon" />
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      )}
    </section>
  );
};

export default GroupList;