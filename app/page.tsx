"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { 
  UploadCloud, 
  File as FileIcon, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Check,
  Copy, 
  RefreshCw, 
  AlertCircle,
  Shield,
  Zap,
  AlignLeft,
  CheckCircle2,
  Circle,
  FileCheck2
} from "lucide-react";
import styles from "./page.module.css";

type SummaryLength = "short" | "medium" | "long";
type ProcessStatus = "idle" | "reading" | "extracting" | "generating" | "success" | "error";

interface ProcessResult {
  summary: string;
  keyPoints: string[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [length, setLength] = useState<SummaryLength>("medium");
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    setErrorMessage("");
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage("Unsupported file type. Please upload a PDF, JPG, PNG, or WebP.");
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File too large. Maximum size is 10MB.");
      return false;
    }
    return true;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        resetState();
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        resetState();
      }
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
    setCopied(false);
  };

  const handleRemove = () => {
    setFile(null);
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string, size = 24, className = "") => {
    if (fileType.includes("pdf")) return <FileText size={size} className={className} />;
    if (fileType.includes("image")) return <ImageIcon size={size} className={className} />;
    return <FileIcon size={size} className={className} />;
  };

  const handleProcess = async () => {
    if (!file) return;

    setStatus("reading");
    setErrorMessage("");
    setResult(null);
    setCopied(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("length", length);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setStatus("extracting");

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (response.status === 504) {
        throw new Error("Request timed out. The document might be too complex or large.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process document");
      }

      setStatus("generating");
      await new Promise(resolve => setTimeout(resolve, 800));

      setResult({
        summary: data.summary,
        keyPoints: data.keyPoints
      });
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const text = `${result.summary}\n\nKey Points:\n${result.keyPoints.map(kp => "• " + kp).join("\n")}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. Landing Page State
  if (!file) {
    return (
      <div className={styles.pageWrapper}>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <div className={styles.navLogo}>
              <div className={styles.logoIcon}>
                <FileCheck2 size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.logoText}>Document Summary Assistant</span>
            </div>
            <div className={styles.navRight}>
              <a href="#how-it-works" className={styles.navLink}>How it works</a>
            </div>
          </div>
        </nav>

        <main>
          {/* HERO SECTION */}
          <section className={styles.heroSection}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>DOCUMENT INTELLIGENCE</span>
              <h1 className={styles.headline}>Turn lengthy documents into clear, useful insights.</h1>
              <p className={styles.subheadline}>Upload a PDF or image and get a structured summary, key points, and the ideas that matter.</p>
              
              <div className={styles.uploadContainer}>
                <div 
                  className={`${styles.uploadBox} ${dragActive ? styles.dragActive : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={onUploadClick}
                >
                  <div className={styles.uploadIconWrapper}>
                    <UploadCloud size={24} className={styles.uploadIconSVG} />
                  </div>
                  <h3 className={styles.uploadTitle}>
                    {dragActive ? "Drop it here" : "Upload your document"}
                  </h3>
                  <p className={styles.uploadSubtitle}>
                    Drag & drop your PDF or image here
                  </p>
                  <div className={styles.uploadMeta}>
                    <span>PDF · JPG · PNG</span>
                    <span className={styles.metaDot}>·</span>
                    <span>Maximum 10 MB</span>
                  </div>
                  <button className={styles.btnUpload} onClick={(e) => { e.stopPropagation(); onUploadClick(); }}>
                    Choose document
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleChange} 
                    className={styles.fileInputHidden}
                    accept=".pdf,image/jpeg,image/png,image/webp"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* USE CASES SECTION */}
          <section className={styles.useCasesSection}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Built for documents that take too long to read</h2>
              </div>
              <div className={styles.useCasesGrid}>
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}><FileText size={20} /></div>
                  <h3 className={styles.useCaseTitle}>Research papers</h3>
                  <p className={styles.useCaseText}>Quickly understand methodology, findings, and conclusions without reading every page.</p>
                </div>
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}><AlignLeft size={20} /></div>
                  <h3 className={styles.useCaseTitle}>Long Reports</h3>
                  <p className={styles.useCaseText}>Extract important findings, metrics, and recommendations instantly.</p>
                </div>
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}><Shield size={20} /></div>
                  <h3 className={styles.useCaseTitle}>Contracts</h3>
                  <p className={styles.useCaseText}>Identify important clauses, obligations, and deadlines at a glance.</p>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section id="how-it-works" className={styles.howItWorksSection}>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeaderCentered}>
                <h2 className={styles.sectionTitle}>From upload to insight</h2>
                <p className={styles.sectionSubtitle}>A seamless process designed to save you hours of reading time.</p>
              </div>
              
              <div className={styles.workflowGrid}>
                <div className={styles.workflowStep}>
                  <div className={styles.workflowVisual}>
                    <div className={styles.mockDocument}>
                      <div className={styles.mockHeader}></div>
                      <div className={styles.mockLine}></div>
                      <div className={styles.mockLine}></div>
                      <div className={styles.mockLineShort}></div>
                    </div>
                  </div>
                  <div className={styles.workflowText}>
                    <div className={styles.stepNumber}>01</div>
                    <h3 className={styles.stepTitle}>Upload</h3>
                    <p className={styles.stepDesc}>Upload your PDF or image securely. We handle the complex parsing.</p>
                  </div>
                </div>

                <div className={styles.workflowStep}>
                  <div className={styles.workflowVisual}>
                    <div className={styles.mockAnalysis}>
                      <Loader2 size={24} className={styles.spinnerPulse} />
                      <div className={styles.mockLinesPulse}>
                        <div className={styles.mockLine}></div>
                        <div className={styles.mockLine}></div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.workflowText}>
                    <div className={styles.stepNumber}>02</div>
                    <h3 className={styles.stepTitle}>Analyze</h3>
                    <p className={styles.stepDesc}>Text is extracted natively or via OCR, then analyzed for core concepts.</p>
                  </div>
                </div>

                <div className={styles.workflowStep}>
                  <div className={styles.workflowVisual}>
                    <div className={styles.mockSummary}>
                      <div className={styles.mockTag}>Key Points</div>
                      <div className={styles.mockBullet}></div>
                      <div className={styles.mockBullet}></div>
                      <div className={styles.mockBullet}></div>
                    </div>
                  </div>
                  <div className={styles.workflowText}>
                    <div className={styles.stepNumber}>03</div>
                    <h3 className={styles.stepTitle}>Understand</h3>
                    <p className={styles.stepDesc}>Receive a structured, highly readable summary with key takeaways.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <FileCheck2 size={16} />
              <span>Document Summary Assistant</span>
            </div>
            <p className={styles.footerText}>Turn documents into useful insights.</p>
          </div>
        </footer>
      </div>
    );
  }

  // 2. Focused Configuration & Processing State
  if (file && status !== "success") {
    const isProcessing = status === "reading" || status === "extracting" || status === "generating";
    
    return (
      <div className={styles.pageWrapperWorkspace}>
        <nav className={styles.navbarWorkspace}>
          <div className={styles.navContainer}>
            <div className={styles.navLogo}>
              <div className={styles.logoIcon}>
                <FileCheck2 size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.logoText}>Document Summary Assistant</span>
            </div>
            <div className={styles.navRight}>
              <button onClick={handleRemove} className={styles.btnNavCancel}>
                Cancel
              </button>
            </div>
          </div>
        </nav>

        <main className={styles.workspaceMainFocused}>
          <div className={styles.focusContainer}>
            <h2 className={styles.focusHeading}>Configure Summary</h2>
            
            <div className={styles.selectedDocumentCard}>
              <div className={styles.selectedIconArea}>
                {getFileIcon(file.type, 24)}
              </div>
              <div className={styles.selectedFileInfo}>
                <div className={styles.selectedFileName}>{file.name}</div>
                <div className={styles.selectedFileDetails}>
                  {file.type.includes("pdf") ? "PDF" : "Image"} · {formatFileSize(file.size)}
                </div>
              </div>
              {!isProcessing && (
                <button onClick={onUploadClick} className={styles.btnChangeFile}>
                  Change
                </button>
              )}
            </div>
            
            {!isProcessing ? (
              <div className={styles.configSection}>
                <h3 className={styles.configTitle}>Summary Length</h3>
                <div className={styles.lengthSelectorGrid}>
                  {(["short", "medium", "long"] as SummaryLength[]).map(l => (
                    <button 
                      key={l}
                      className={`${styles.lengthCard} ${length === l ? styles.active : ""}`}
                      onClick={() => setLength(l)}
                    >
                      <span className={styles.lengthCardTitle}>{l.charAt(0).toUpperCase() + l.slice(1)}</span>
                      <span className={styles.lengthCardSub}>
                        {l === "short" && "Quick overview"}
                        {l === "medium" && "Balanced detail"}
                        {l === "long" && "More context"}
                      </span>
                    </button>
                  ))}
                </div>

                {errorMessage && (
                  <div className={styles.errorAlert}>
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className={styles.actionRow}>
                  <button className={styles.btnGenerate} onClick={handleProcess}>
                    Generate Summary
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.processingSection}>
                <div className={styles.processingHeader}>
                  <Loader2 size={20} className={styles.spinnerPrimary} />
                  <h3>Processing Document</h3>
                </div>
                <div className={styles.processingList}>
                  <div className={`${styles.processingItem} ${status === "reading" ? styles.active : (status === "extracting" || status === "generating" ? styles.done : "")}`}>
                    {status === "reading" ? <Circle size={16} className={styles.indicatorActive} /> : <CheckCircle2 size={16} className={styles.indicatorDone} />}
                    <span>Reading your document...</span>
                  </div>
                  <div className={`${styles.processingItem} ${status === "extracting" ? styles.active : (status === "generating" ? styles.done : styles.pending)}`}>
                    {status === "extracting" ? <Circle size={16} className={styles.indicatorActive} /> : (status === "generating" ? <CheckCircle2 size={16} className={styles.indicatorDone} /> : <Circle size={16} className={styles.indicatorPending} />)}
                    <span>Extracting text via parsing & OCR...</span>
                  </div>
                  <div className={`${styles.processingItem} ${status === "generating" ? styles.active : styles.pending}`}>
                    {status === "generating" ? <Circle size={16} className={styles.indicatorActive} /> : <Circle size={16} className={styles.indicatorPending} />}
                    <span>Generating structured insights...</span>
                  </div>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleChange} 
              className={styles.fileInputHidden}
              accept=".pdf,image/jpeg,image/png,image/webp"
            />
          </div>
        </main>
      </div>
    );
  }

  // 3. Results Workspace State
  return (
    <div className={styles.pageWrapperWorkspace}>
      <nav className={styles.navbarWorkspace}>
        <div className={styles.navContainer}>
          <div className={styles.navLogo}>
            <div className={styles.logoIcon}>
              <FileCheck2 size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoText}>Document Summary Assistant</span>
          </div>
          <div className={styles.navRight}>
             <button onClick={handleRemove} className={styles.btnNavOutline}>
                Process another document
             </button>
          </div>
        </div>
      </nav>

      <main className={styles.resultsLayout}>
        <div className={styles.resultsContainer}>
          
          <div className={styles.resultsHeader}>
            <div className={styles.documentBadge}>
               {getFileIcon(file.type, 16)}
               <span>{file.name}</span>
            </div>
            
            <div className={styles.resultsActions}>
               <div className={styles.compactLengthSelector}>
                  {(["short", "medium", "long"] as SummaryLength[]).map(l => (
                    <button 
                      key={l}
                      className={`${styles.compactLengthBtn} ${length === l ? styles.active : ""}`}
                      onClick={() => setLength(l)}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
               </div>
               <button onClick={handleProcess} className={styles.btnActionSecondary}>
                  <RefreshCw size={14} /> Regenerate
               </button>
               <button onClick={copyToClipboard} className={styles.btnActionPrimary}>
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
               </button>
            </div>
          </div>

          <div className={styles.resultsColumns}>
            <div className={styles.mainColumn}>
              <article className={styles.summaryDocument}>
                <h2 className={styles.documentTitle}>Executive Summary</h2>
                <div className={styles.documentContent}>
                  {result?.summary}
                </div>
              </article>
            </div>
            
            <aside className={styles.sidebarColumn}>
              <div className={styles.sidebarBox}>
                <h3 className={styles.sidebarBoxTitle}>Document Details</h3>
                <ul className={styles.metaList}>
                  <li>
                    <span className={styles.metaLabel}>File</span>
                    <span className={styles.metaValue} title={file.name}>{file.name.length > 22 ? file.name.substring(0, 22) + '...' : file.name}</span>
                  </li>
                  <li>
                    <span className={styles.metaLabel}>Type</span>
                    <span className={styles.metaValue}>{file.type.includes("pdf") ? "PDF Document" : "Image"}</span>
                  </li>
                  <li>
                    <span className={styles.metaLabel}>Size</span>
                    <span className={styles.metaValue}>{formatFileSize(file.size)}</span>
                  </li>
                </ul>
              </div>

              <div className={styles.sidebarBoxTransparent}>
                <h3 className={styles.sidebarBoxTitle}>Key Takeaways</h3>
                <div className={styles.takeawaysList}>
                  {result?.keyPoints.map((point, i) => (
                    <div key={i} className={styles.takeawayBlock}>
                      <div className={styles.takeawayNum}>0{i + 1}</div>
                      <div className={styles.takeawayBody}>{point}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
          
        </div>
      </main>
    </div>
  );
}
