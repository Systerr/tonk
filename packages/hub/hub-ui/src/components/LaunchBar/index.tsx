import { BookIcon, TerminalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../";
import { launchApp } from "../../ipc/app";
import { getConfig } from "../../ipc/config";
import { platformSensitiveJoin } from "../../ipc/files";
import { useProjectStore } from "../../stores/projectStore";
import { FileDescription } from "../../types";
import { Tab } from "../Terminal";
import { FileType, TreeItem } from "../Tree";
import styles from "./LaunchBar.module.css";

const AppLaunchBar = (props: {
  readmeDir: FileDescription | null;
  tab: Tab;
  setTab: (tab: Tab) => void;
  selectedItem: TreeItem;
  commandCallback: (cmd: string) => void;
}) => {
  const { tab, setTab, selectedItem, commandCallback, readmeDir } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const launch = async () => {
    try {
      const config = await getConfig();
      const fullPath = await platformSensitiveJoin([
        config!.homePath,
        selectedItem.index,
      ]);
      const url = await launchApp(fullPath!);
      setUrl(url || null);
    } catch (error) {
      console.error("Error launching app:", error);
      setUrl(null);
    }
  };

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.buttonArea}>
      {!!readmeDir ? (
        <div className={styles.tabButtons}>
          <Button
            color={tab === "terminal" ? "default" : "default"}
            size="sm"
            shape="rounded"
            onClick={() => setTab("terminal")}
            title="Open terminal"
            tooltip="Terminal"
            tooltipPosition="top"
            className={tab === "terminal" ? styles.selectedTab : ""}
            style={{ opacity: tab === "terminal" ? 1 : 0.7 }}
          >
            <TerminalIcon className={styles.smallerIcon} />
          </Button>
          <Button
            color={tab === "readme" ? "default" : "default"}
            size="sm"
            shape="rounded"
            onClick={() => setTab("readme")}
            title="Open README"
            tooltip="README"
            tooltipPosition="top"
            className={tab === "readme" ? styles.selectedTab : ""}
            style={{ opacity: tab === "readme" ? 1 : 0.7 }}
          >
            <BookIcon className={styles.smallerIcon} />
          </Button>
        </div>
      ) : (
        <div></div>
      )}
      <div>
        <Button color="green" size="sm" shape="rounded" onClick={launch}>
          Launch
        </Button>
        {url && (
          <div
            style={{
              fontSize: "12px",
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "5px",
            }}
          >
            Your app is live at{" "}
            <Button
              size="sm"
              onClick={copyToClipboard}
              title="Click to copy URL"
            >
              <span style={{ marginRight: "5px" }}>{url}</span>
              <span style={{ fontSize: "14px" }}>{copied ? "✓" : "📋"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LaunchBar = (props: {
  readmeDir: FileDescription | null;
  tab: Tab;
  setTab: (tab: Tab) => void;
  commandCallback: (cmd: string) => void;
}) => {
  const { selectedItem } = useProjectStore();
  const { commandCallback, tab, setTab, readmeDir } = props;
  if (!selectedItem || selectedItem.data.fileType !== FileType.App) {
    return null;
  }
  return (
    <AppLaunchBar
      readmeDir={readmeDir}
      tab={tab}
      setTab={setTab}
      selectedItem={selectedItem}
      commandCallback={commandCallback}
    />
  );
};

export default LaunchBar;
