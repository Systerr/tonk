import React, { useEffect, useRef, useState } from "react";
import styles from "./Terminal.module.css";
import { TerminalManager } from "./TerminalManager";

// Import xterm.js styles
import ReactMarkdown from "react-markdown";
import "xterm/css/xterm.css";
import { getConfig } from "../../ipc/config";
import { ls, platformSensitiveJoin, readFile } from "../../ipc/files";
import { closeShell, runShell } from "../../ipc/hub";
import { useProjectStore } from "../../stores/projectStore";
import { FileDescription } from "../../types";
import LaunchBar from "../LaunchBar";

export type Tab = "terminal" | "readme";

const ReadmeViewer: React.FC<{ readmeDir: FileDescription | null }> = ({
  readmeDir,
}) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedItem } = useProjectStore();

  useEffect(() => {
    const loadReadmeContent = async () => {
      if (!readmeDir || !selectedItem) return;

      try {
        setLoading(true);
        setError(null);

        const config = await getConfig();
        const fullPath = await platformSensitiveJoin([
          config!.homePath,
          selectedItem.index,
          readmeDir.name,
        ]);

        const readmeContent = await readFile(fullPath!);
        setContent(readmeContent || "");
      } catch (err) {
        console.error("Error loading README:", err);
        setError("Failed to load README content");
      } finally {
        setLoading(false);
      }
    };

    loadReadmeContent();
  }, [readmeDir, selectedItem]);

  if (loading) {
    return <div className={styles.readmeLoading}>Loading README...</div>;
  }

  if (error) {
    return <div className={styles.readmeError}>{error}</div>;
  }

  return (
    <div className={styles.readmeContainer}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

const Terminal: React.FC = () => {
  const [tab, setTab] = useState<Tab>("terminal");
  const [cmd, setCmd] = useState("");
  const [readmeDir, setReadmeDir] = useState<FileDescription | null>(null);

  useEffect(() => {
    if (cmd !== "") {
      setTimeout(() => {
        setCmd("");
      }, 200);
    }
  }, [cmd]);

  const { selectedItem } = useProjectStore();

  useEffect(() => {
    if (!selectedItem) return;
    const fn = async () => {
      const config = await getConfig();
      const children = await ls(config!.homePath, selectedItem.index);
      setReadmeDir(
        children?.find((child) => child.name === "README.md") || null
      );
    };
    fn();
  }, [selectedItem]);

  return (
    <div className={styles.container}>
      {tab === "terminal" ? (
        <_Terminal cmd={cmd} />
      ) : (
        <ReadmeViewer readmeDir={readmeDir} />
      )}
      <div className={styles.launchBarContainer}>
        <LaunchBar
          tab={tab}
          setTab={setTab}
          commandCallback={setCmd}
          readmeDir={readmeDir}
        />
      </div>
    </div>
  );
};

const _Terminal: React.FC<{ cmd: string }> = ({ cmd }) => {
  const [isConnected, setIsConnected] = useState(false);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalManagerRef = useRef<TerminalManager | null>(null);
  const { selectedItem } = useProjectStore();
  useEffect(() => {
    const fn = async () => {
      if (selectedItem) {
        const config = await getConfig();
        const subPath = selectedItem.index.split("/");
        const fullPath = await platformSensitiveJoin([
          config!.homePath,
          ...subPath,
        ]);
        closeShell().then(() => {
          runShell(fullPath!);
        });
      }
    };
    fn();
  }, [selectedItem]);

  // Initialize the terminal manager
  useEffect(() => {
    let mounted = true;

    const initializeTerminalManager = async () => {
      if (!terminalContainerRef.current || !mounted) return;

      // Create new terminal manager instance
      const manager = new TerminalManager({
        container: terminalContainerRef.current,
      });

      // Set connection change handler
      manager.setOnConnectionChange((connected) => {
        if (mounted) {
          setIsConnected(connected);
        }
      });

      // Initialize the terminal
      await manager.initialize();

      if (!mounted) {
        manager.dispose();
        return;
      }

      // Store the manager instance
      terminalManagerRef.current = manager;
    };

    // Wait for next tick to ensure container is mounted
    setTimeout(initializeTerminalManager, 0);

    // Clean up on unmount
    return () => {
      mounted = false;
      if (terminalManagerRef.current) {
        terminalManagerRef.current.dispose();
      }
    };
  }, []);

  // Connect to the selected item
  useEffect(() => {
    // wait for 50 ms before connecting to the selected item
    setTimeout(() => {
      if (!terminalManagerRef.current || !selectedItem) return;

      // Connect to the selected item
      terminalManagerRef.current.connectToItem(selectedItem.data);
    }, 50);
  }, [selectedItem]);

  // Handle commands
  useEffect(() => {
    if (cmd !== "" && terminalManagerRef.current) {
      terminalManagerRef.current.executeCommand(cmd);
    }
  }, [cmd]);

  return (
    <div className={styles.container}>
      <div
        key={1}
        className={styles.terminalContainer}
        ref={terminalContainerRef}
        tabIndex={1}
      />
      {!isConnected && (
        <div className={styles.disconnectedAlert}>
          Disconnected from terminal server
        </div>
      )}
    </div>
  );
};

export default Terminal;
