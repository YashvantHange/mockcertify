/**
 * Generates official blueprint JSON files for all 16 certifications.
 * Run: node packages/database/content/build-blueprints.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "blueprints");
mkdirSync(outDir, { recursive: true });

const LAST_REVIEWED = "2026-05-16";
const TARGET = 500;
const MIX = { easy: 30, medium: 40, hard: 30 };

function obj(id, description) {
  return { id, description };
}

function domain(slug, name, weightPercent, objectives) {
  return { slug, name, weightPercent, objectives };
}

const blueprints = [
  {
    slug: "aws-saa-c03",
    examCode: "SAA-C03",
    name: "AWS Solutions Architect Associate",
    provider: "AWS",
    officialGuideUrl: "https://d1.awsstatic.com/training-and-certification/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf",
    referenceUrls: ["https://docs.aws.amazon.com/", "https://aws.amazon.com/certification/certified-solutions-architect-associate/"],
    domains: [
      domain("resilient-arch", "Design Resilient Architectures", 30, [
        obj("RA-1", "Design scalable and loosely coupled solutions using AWS services"),
        obj("RA-2", "Design highly available and fault-tolerant architectures"),
        obj("RA-3", "Design resilient storage and database solutions"),
        obj("RA-4", "Implement disaster recovery strategies"),
      ]),
      domain("high-performing", "Design High-Performing Architectures", 28, [
        obj("HP-1", "Identify elastic compute solutions for workloads"),
        obj("HP-2", "Design high-performing storage solutions"),
        obj("HP-3", "Design high-performing networking solutions"),
        obj("HP-4", "Determine appropriate database solutions for performance"),
      ]),
      domain("secure-apps", "Design Secure Applications and Architectures", 24, [
        obj("SA-1", "Design secure access to AWS resources"),
        obj("SA-2", "Design secure application tiers"),
        obj("SA-3", "Determine data security controls"),
        obj("SA-4", "Design secure network infrastructure"),
      ]),
      domain("cost-optimized", "Design Cost-Optimized Architectures", 18, [
        obj("CO-1", "Design cost-optimized compute solutions"),
        obj("CO-2", "Design cost-optimized storage solutions"),
        obj("CO-3", "Design cost-optimized database solutions"),
        obj("CO-4", "Design cost-optimized network architectures"),
      ]),
    ],
  },
  {
    slug: "aws-security-specialty",
    examCode: "SCS-C02",
    name: "AWS Certified Security – Specialty",
    provider: "AWS",
    officialGuideUrl: "https://d1.awsstatic.com/training-and-certification/docs-security-spec/AWS-Certified-Security-Specialty_Exam-Guide.pdf",
    referenceUrls: ["https://docs.aws.amazon.com/security/", "https://aws.amazon.com/certification/certified-security-specialty/"],
    domains: [
      domain("incident-response", "Incident Response", 20, [
        obj("IR-1", "Design and implement incident response workflows"),
        obj("IR-2", "Triage security events and automate response"),
        obj("IR-3", "Contain and eradicate threats in AWS"),
      ]),
      domain("logging-monitoring", "Logging and Monitoring", 20, [
        obj("LM-1", "Design centralized logging architectures"),
        obj("LM-2", "Implement detective controls and alerting"),
        obj("LM-3", "Analyze logs for security anomalies"),
      ]),
      domain("infrastructure-security", "Infrastructure Security", 26, [
        obj("IS-1", "Design secure VPC and network segmentation"),
        obj("IS-2", "Harden compute and container workloads"),
        obj("IS-3", "Implement edge and DDoS protection"),
        obj("IS-4", "Secure serverless and API endpoints"),
      ]),
      domain("iam", "Identity and Access Management", 20, [
        obj("IAM-1", "Design least-privilege IAM policies"),
        obj("IAM-2", "Implement federation and SSO"),
        obj("IAM-3", "Manage secrets and credentials"),
      ]),
      domain("data-protection", "Data Protection", 14, [
        obj("DP-1", "Encrypt data at rest and in transit"),
        obj("DP-2", "Implement key management with KMS"),
        obj("DP-3", "Design data classification and retention"),
      ]),
    ],
  },
  {
    slug: "aws-ml-specialty",
    examCode: "MLS-C01",
    name: "AWS Certified Machine Learning – Specialty",
    provider: "AWS",
    officialGuideUrl: "https://d1.awsstatic.com/training-and-certification/docs-ml-spec/AWS-Certified-Machine-Learning-Specialty_Exam-Guide.pdf",
    referenceUrls: ["https://docs.aws.amazon.com/sagemaker/", "https://aws.amazon.com/certification/certified-machine-learning-specialty/"],
    domains: [
      domain("data-engineering", "Data Engineering", 20, [
        obj("DE-1", "Create data repositories for ML"),
        obj("DE-2", "Identify and implement data ingestion solutions"),
        obj("DE-3", "Data transformation, integrity, and feature stores"),
      ]),
      domain("exploratory-analysis", "Exploratory Data Analysis", 24, [
        obj("EA-1", "Sanitize and prepare data for modeling"),
        obj("EA-2", "Perform feature engineering"),
        obj("EA-3", "Visualize data and communicate insights"),
        obj("EA-4", "Identify bias and data quality issues"),
      ]),
      domain("modeling", "Modeling", 36, [
        obj("MO-1", "Select appropriate ML algorithms"),
        obj("MO-2", "Train and tune models on SageMaker"),
        obj("MO-3", "Evaluate model metrics and overfitting"),
        obj("MO-4", "Deploy models for inference"),
        obj("MO-5", "Use built-in algorithms and custom training"),
      ]),
      domain("ml-operations", "ML Implementation and Operations", 20, [
        obj("ML-1", "Build ML pipelines and MLOps"),
        obj("ML-2", "Apply security and compliance to ML workloads"),
        obj("ML-3", "Monitor models in production"),
        obj("ML-4", "Optimize cost and performance of ML systems"),
      ]),
    ],
  },
  {
    slug: "az-900",
    examCode: "AZ-900",
    name: "Microsoft Azure Fundamentals",
    provider: "Microsoft",
    officialGuideUrl: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900",
    referenceUrls: ["https://learn.microsoft.com/azure/", "https://learn.microsoft.com/credentials/certifications/azure-fundamentals/"],
    domains: [
      domain("cloud-concepts", "Describe Cloud Concepts", 25, [
        obj("CC-1", "Define cloud computing and shared responsibility"),
        obj("CC-2", "Describe cloud models: public, private, hybrid"),
        obj("CC-3", "Compare consumption-based pricing models"),
      ]),
      domain("azure-architecture", "Describe Azure Architecture and Services", 35, [
        obj("AA-1", "Describe core Azure architectural components"),
        obj("AA-2", "Describe Azure compute and networking services"),
        obj("AA-3", "Describe Azure storage services"),
        obj("AA-4", "Describe Azure identity and security services"),
      ]),
      domain("azure-management", "Describe Azure Management and Governance", 30, [
        obj("AM-1", "Describe cost management in Azure"),
        obj("AM-2", "Describe governance and compliance tools"),
        obj("AM-3", "Describe management and deployment tools"),
      ]),
      domain("azure-governance", "Describe Azure Governance Features", 10, [
        obj("AG-1", "Describe Azure Policy and Blueprints"),
        obj("AG-2", "Describe resource locks and tags"),
      ]),
    ],
  },
  {
    slug: "sc-200",
    examCode: "SC-200",
    name: "Microsoft Security Operations Analyst",
    provider: "Microsoft",
    officialGuideUrl: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200",
    referenceUrls: ["https://learn.microsoft.com/security/", "https://learn.microsoft.com/credentials/certifications/security-operations-analyst/"],
    domains: [
      domain("mitigate-threats", "Mitigate Threats Using Microsoft Security Solutions", 35, [
        obj("MT-1", "Mitigate threats using Microsoft Defender XDR"),
        obj("MT-2", "Configure endpoint protection and EDR"),
        obj("MT-3", "Investigate and remediate identity threats"),
        obj("MT-4", "Protect cloud workloads with Defender for Cloud"),
      ]),
      domain("manage-incidents", "Manage Security Incidents in Microsoft Sentinel", 30, [
        obj("MI-1", "Design and configure Sentinel workspaces"),
        obj("MI-2", "Create analytics rules and automation"),
        obj("MI-3", "Investigate incidents and use KQL"),
        obj("MI-4", "Manage threat intelligence and hunting"),
      ]),
      domain("hunting-response", "Perform Threat Hunting and Response", 20, [
        obj("HR-1", "Conduct proactive threat hunting"),
        obj("HR-2", "Use advanced hunting and notebooks"),
        obj("HR-3", "Coordinate incident response workflows"),
      ]),
      domain("security-ops", "Implement Security Operations Best Practices", 15, [
        obj("SO-1", "Configure security baselines and policies"),
        obj("SO-2", "Manage security operations reporting"),
        obj("SO-3", "Integrate third-party security tools"),
      ]),
    ],
  },
  {
    slug: "google-cloud-associate",
    examCode: "Associate Cloud Engineer",
    name: "Google Cloud Associate Cloud Engineer",
    provider: "Google",
    officialGuideUrl: "https://cloud.google.com/learn/certification/cloud-engineer",
    referenceUrls: ["https://cloud.google.com/docs", "https://cloud.google.com/certification/cloud-engineer"],
    domains: [
      domain("setting-up", "Setting Up a Cloud Solution Environment", 17.5, [
        obj("SU-1", "Set up cloud projects and billing"),
        obj("SU-2", "Manage users and service accounts"),
        obj("SU-3", "Enable APIs and provision resources"),
      ]),
      domain("planning-config", "Planning and Configuring a Cloud Solution", 17.5, [
        obj("PC-1", "Plan compute, storage, and network resources"),
        obj("PC-2", "Configure IAM and organization policies"),
        obj("PC-3", "Design for security and compliance"),
      ]),
      domain("deploying", "Deploying and Implementing a Cloud Solution", 25, [
        obj("DP-1", "Deploy compute resources (GCE, GKE, Cloud Run)"),
        obj("DP-2", "Deploy and manage networking (VPC, load balancers)"),
        obj("DP-3", "Deploy data services (Cloud SQL, BigQuery, Storage)"),
        obj("DP-4", "Implement CI/CD with Cloud Build"),
      ]),
      domain("operations", "Ensuring Successful Operation of a Cloud Solution", 17.5, [
        obj("OP-1", "Monitor and log with Cloud Operations"),
        obj("OP-2", "Manage incidents and optimize performance"),
        obj("OP-3", "Maintain managed services"),
      ]),
      domain("access-security", "Configuring Access and Security", 22.5, [
        obj("AS-1", "Configure IAM roles and permissions"),
        obj("AS-2", "Implement VPC security controls"),
        obj("AS-3", "Manage encryption and secrets"),
      ]),
    ],
  },
  {
    slug: "cka",
    examCode: "CKA",
    name: "Certified Kubernetes Administrator",
    provider: "CNCF",
    officialGuideUrl: "https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.31.pdf",
    referenceUrls: ["https://kubernetes.io/docs/", "https://www.cncf.io/certification/cka/"],
    domains: [
      domain("storage", "Storage", 10, [
        obj("ST-1", "Implement storage classes and PVs"),
        obj("ST-2", "Configure persistent volume claims"),
      ]),
      domain("workloads", "Workloads & Scheduling", 15, [
        obj("WL-1", "Deploy and manage deployments, daemonsets, statefulsets"),
        obj("WL-2", "Configure resource requests and limits"),
        obj("WL-3", "Use ConfigMaps and Secrets"),
      ]),
      domain("services-networking", "Services & Networking", 20, [
        obj("SN-1", "Configure Services and Ingress"),
        obj("SN-2", "Implement network policies"),
        obj("SN-3", "Use CoreDNS and troubleshoot networking"),
      ]),
      domain("cluster-architecture", "Cluster Architecture, Installation & Configuration", 25, [
        obj("CA-1", "Manage RBAC and service accounts"),
        obj("CA-2", "Perform cluster upgrades"),
        obj("CA-3", "Install and configure clusters"),
        obj("CA-4", "Manage etcd backups"),
      ]),
      domain("troubleshooting", "Troubleshooting", 30, [
        obj("TR-1", "Troubleshoot application failures"),
        obj("TR-2", "Troubleshoot control plane components"),
        obj("TR-3", "Troubleshoot worker node failures"),
        obj("TR-4", "Troubleshoot networking issues"),
      ]),
    ],
  },
  {
    slug: "ceh",
    examCode: "CEH v12",
    name: "Certified Ethical Hacker",
    provider: "EC-Council",
    officialGuideUrl: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/",
    referenceUrls: ["https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/"],
    domains: [
      domain("reconnaissance", "Information Security and Ethical Hacking Overview", 20, [
        obj("RC-1", "Footprinting and reconnaissance techniques"),
        obj("RC-2", "Scanning networks and enumeration"),
        obj("RC-3", "Vulnerability analysis methodology"),
      ]),
      domain("system-hacking", "System Hacking Phases", 25, [
        obj("SH-1", "Gaining access and escalating privileges"),
        obj("SH-2", "Maintaining access and covering tracks"),
        obj("SH-3", "Malware threats and countermeasures"),
      ]),
      domain("network-attacks", "Network and Perimeter Hacking", 25, [
        obj("NA-1", "Sniffing and session hijacking"),
        obj("NA-2", "Evading IDS, firewalls, and honeypots"),
        obj("NA-3", "Hacking wireless networks"),
      ]),
      domain("web-hacking", "Web Application and Cloud Hacking", 30, [
        obj("WH-1", "Web server and application attacks"),
        obj("WH-2", "SQL injection and XSS"),
        obj("WH-3", "IoT and cloud hacking concepts"),
        obj("WH-4", "Cryptography attacks and defenses"),
      ]),
    ],
  },
  {
    slug: "security-plus",
    examCode: "SY0-701",
    name: "CompTIA Security+",
    provider: "CompTIA",
    officialGuideUrl: "https://www.comptia.org/certifications/security",
    referenceUrls: ["https://www.comptia.org/certifications/security", "https://www.comptia.org/training/resources/exam-objectives"],
    domains: [
      domain("general-security", "General Security Concepts", 12, [
        obj("GS-1", "Compare security controls"),
        obj("GS-2", "Explain fundamental security concepts"),
        obj("GS-3", "Summarize change management and resilience"),
      ]),
      domain("threats-vulnerabilities", "Threats, Vulnerabilities, and Mitigations", 22, [
        obj("TV-1", "Identify social engineering and malware"),
        obj("TV-2", "Analyze indicators of compromise"),
        obj("TV-3", "Explain vulnerability scanning and pentesting"),
        obj("TV-4", "Mitigate vulnerabilities"),
      ]),
      domain("security-architecture", "Security Architecture", 18, [
        obj("SA-1", "Secure enterprise infrastructure"),
        obj("SA-2", "Secure cloud and hybrid environments"),
        obj("SA-3", "Secure mobile and embedded devices"),
      ]),
      domain("security-operations", "Security Operations", 28, [
        obj("SO-1", "Implement incident response procedures"),
        obj("SO-2", "Use digital forensics tools"),
        obj("SO-3", "Apply secure baselines and hardening"),
        obj("SO-4", "Automate security tasks"),
      ]),
      domain("security-program", "Security Program Management and Oversight", 20, [
        obj("SP-1", "Governance, risk, and compliance"),
        obj("SP-2", "Privacy and data protection"),
        obj("SP-3", "Third-party risk management"),
      ]),
    ],
  },
  {
    slug: "cissp",
    examCode: "CISSP",
    name: "Certified Information Systems Security Professional",
    provider: "ISC2",
    officialGuideUrl: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline",
    referenceUrls: ["https://www.isc2.org/certifications/cissp", "https://www.isc2.org/CISSP-Exam-Outline"],
    domains: [
      domain("security-risk", "Security and Risk Management", 15, [
        obj("SR-1", "Understand security governance principles"),
        obj("SR-2", "Manage risk and compliance"),
        obj("SR-3", "Apply business continuity concepts"),
      ]),
      domain("asset-security", "Asset Security", 10, [
        obj("AS-1", "Classify and protect information assets"),
        obj("AS-2", "Manage data lifecycle and retention"),
      ]),
      domain("security-architecture", "Security Architecture and Engineering", 13, [
        obj("AE-1", "Implement secure design principles"),
        obj("AE-2", "Select cryptographic solutions"),
        obj("AE-3", "Assess and mitigate vulnerabilities"),
      ]),
      domain("communication-network", "Communication and Network Security", 13, [
        obj("CN-1", "Design secure network architecture"),
        obj("CN-2", "Secure network components and protocols"),
      ]),
      domain("iam", "Identity and Access Management", 13, [
        obj("IA-1", "Control physical and logical access"),
        obj("IA-2", "Manage identification and authentication"),
        obj("IA-3", "Federate identity across systems"),
      ]),
      domain("security-assessment", "Security Assessment and Testing", 12, [
        obj("AT-1", "Design and validate assessment strategies"),
        obj("AT-2", "Conduct security audits and testing"),
      ]),
      domain("security-operations", "Security Operations", 13, [
        obj("OP-1", "Support investigations and incident management"),
        obj("OP-2", "Implement logging and monitoring"),
        obj("OP-3", "Manage disaster recovery"),
      ]),
      domain("software-security", "Software Development Security", 11, [
        obj("SD-1", "Integrate security into SDLC"),
        obj("SD-2", "Apply secure coding standards"),
      ]),
    ],
  },
  {
    slug: "oscp",
    examCode: "OSCP",
    name: "Offensive Security Certified Professional",
    provider: "Offensive Security",
    officialGuideUrl: "https://www.offensive-security.com/oscp/",
    referenceUrls: ["https://www.offensive-security.com/oscp/", "https://help.offensive-security.com/"],
    domains: [
      domain("information-gathering", "Information Gathering", 15, [
        obj("IG-1", "Passive and active reconnaissance"),
        obj("IG-2", "Service enumeration and OSINT"),
      ]),
      domain("vulnerability-analysis", "Vulnerability Analysis", 20, [
        obj("VA-1", "Scanning with Nmap and vulnerability scanners"),
        obj("VA-2", "Analyzing and prioritizing findings"),
        obj("VA-3", "Web application enumeration"),
      ]),
      domain("exploitation", "Exploitation", 35, [
        obj("EX-1", "Buffer overflow exploitation"),
        obj("EX-2", "Client-side and remote exploits"),
        obj("EX-3", "Web application exploitation"),
        obj("EX-4", "Password attacks and cracking"),
      ]),
      domain("post-exploitation", "Post-Exploitation and Privilege Escalation", 20, [
        obj("PE-1", "Linux privilege escalation techniques"),
        obj("PE-2", "Windows privilege escalation techniques"),
        obj("PE-3", "Lateral movement and pivoting"),
      ]),
      domain("reporting", "Reporting and Documentation", 10, [
        obj("RP-1", "Document findings and proof of concept"),
        obj("RP-2", "Write professional penetration test reports"),
      ]),
    ],
  },
  {
    slug: "ccna",
    examCode: "200-301",
    name: "Cisco CCNA",
    provider: "Cisco",
    officialGuideUrl: "https://learningnetwork.cisco.com/s/ccna-exam-topics",
    referenceUrls: ["https://learningnetwork.cisco.com/s/ccna", "https://www.cisco.com/c/en/us/training-events/training-certifications/exams/current-list/ccna-200-301.html"],
    domains: [
      domain("network-fundamentals", "Network Fundamentals", 20, [
        obj("NF-1", "Compare OSI and TCP/IP models"),
        obj("NF-2", "Describe IPv4/IPv6 addressing and subnetting"),
        obj("NF-3", "Explain wireless fundamentals"),
      ]),
      domain("ip-connectivity", "Network Access and IP Connectivity", 25, [
        obj("IC-1", "Configure VLANs and trunking"),
        obj("IC-2", "Configure inter-VLAN routing"),
        obj("IC-3", "Configure OSPF and static routing"),
      ]),
      domain("ip-services", "IP Services", 25, [
        obj("IS-1", "Configure NAT and NTP"),
        obj("IS-2", "Configure DHCP and DNS"),
        obj("IS-3", "Configure SNMP, syslog, and QoS basics"),
      ]),
      domain("security-fundamentals", "Security Fundamentals", 15, [
        obj("SF-1", "Configure ACLs and port security"),
        obj("SF-2", "Describe wireless security and VPN basics"),
      ]),
      domain("automation", "Automation and Programmability", 15, [
        obj("AU-1", "Compare controller-based networking"),
        obj("AU-2", "Describe REST APIs and JSON/YAML"),
        obj("AU-3", "Use Ansible and network automation tools"),
      ]),
    ],
  },
  {
    slug: "network-plus",
    examCode: "N10-009",
    name: "CompTIA Network+",
    provider: "CompTIA",
    officialGuideUrl: "https://www.comptia.org/certifications/network",
    referenceUrls: ["https://www.comptia.org/certifications/network"],
    domains: [
      domain("networking-concepts", "Networking Concepts", 23, [
        obj("NC-1", "Explain OSI model and protocols"),
        obj("NC-2", "Describe ports, IP addressing, and subnetting"),
        obj("NC-3", "Compare network topologies and technologies"),
      ]),
      domain("network-implementation", "Network Implementation", 20, [
        obj("NI-1", "Configure routing and switching"),
        obj("NI-2", "Deploy wired and wireless networks"),
        obj("NI-3", "Implement network services"),
      ]),
      domain("network-operations", "Network Operations", 19, [
        obj("NO-1", "Monitor and optimize network performance"),
        obj("NO-2", "Use network troubleshooting methodology"),
        obj("NO-3", "Manage documentation and change control"),
      ]),
      domain("network-security", "Network Security", 14, [
        obj("NS-1", "Implement network hardening"),
        obj("NS-2", "Configure firewalls and access control"),
      ]),
      domain("network-troubleshooting", "Network Troubleshooting", 24, [
        obj("NT-1", "Troubleshoot cabling and physical issues"),
        obj("NT-2", "Troubleshoot connectivity and DNS"),
        obj("NT-3", "Troubleshoot wireless and security issues"),
      ]),
    ],
  },
  {
    slug: "linux-plus",
    examCode: "XK0-005",
    name: "CompTIA Linux+",
    provider: "CompTIA",
    officialGuideUrl: "https://www.comptia.org/certifications/linux",
    referenceUrls: ["https://www.comptia.org/certifications/linux"],
    domains: [
      domain("system-management", "System Management", 32, [
        obj("SM-1", "Manage Linux boot process and systemd"),
        obj("SM-2", "Configure storage and filesystems"),
        obj("SM-3", "Manage packages and repositories"),
        obj("SM-4", "Manage users, groups, and permissions"),
      ]),
      domain("security", "Security", 21, [
        obj("SE-1", "Configure firewalls and SELinux/AppArmor"),
        obj("SE-2", "Implement SSH and certificate management"),
        obj("SE-3", "Apply logging and auditing controls"),
      ]),
      domain("scripting-containers", "Scripting, Containers, and Automation", 19, [
        obj("SC-1", "Write bash scripts and cron jobs"),
        obj("SC-2", "Use Git and orchestration basics"),
        obj("SC-3", "Deploy and manage containers"),
      ]),
      domain("troubleshooting", "Troubleshooting", 28, [
        obj("TR-1", "Analyze system logs and performance"),
        obj("TR-2", "Troubleshoot network and application issues"),
        obj("TR-3", "Diagnose boot and storage failures"),
      ]),
    ],
  },
  {
    slug: "pmp",
    examCode: "PMP",
    name: "Project Management Professional",
    provider: "PMI",
    officialGuideUrl: "https://www.pmi.org/certifications/project-management-pmp",
    referenceUrls: ["https://www.pmi.org/certifications/project-management-pmp", "https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/pmp-examination-content-outline.pdf"],
    domains: [
      domain("people", "People", 42, [
        obj("PE-1", "Manage conflict and lead teams"),
        obj("PE-2", "Support team performance and development"),
        obj("PE-3", "Empower stakeholders and negotiate"),
        obj("PE-4", "Build shared understanding and engagement"),
      ]),
      domain("process", "Process", 50, [
        obj("PR-1", "Execute projects with appropriate methodology"),
        obj("PR-2", "Manage scope, schedule, and budget"),
        obj("PR-3", "Manage quality and resources"),
        obj("PR-4", "Manage communications and risks"),
        obj("PR-5", "Manage procurement and integrations"),
      ]),
      domain("business-environment", "Business Environment", 8, [
        obj("BE-1", "Plan and manage project compliance"),
        obj("BE-2", "Evaluate and deliver business benefits"),
        obj("BE-3", "Support organizational change"),
      ]),
    ],
  },
  {
    slug: "itil-foundation",
    examCode: "ITIL 4 Foundation",
    name: "ITIL 4 Foundation",
    provider: "AXELOS",
    officialGuideUrl: "https://www.axelos.com/certifications/itil-service-management/itil-4-foundation",
    referenceUrls: ["https://www.axelos.com/certifications/itil-service-management/itil-4-foundation"],
    domains: [
      domain("service-management", "Understand Key Concepts of Service Management", 15, [
        obj("SM-1", "Define service, value, and stakeholders"),
        obj("SM-2", "Describe service relationships and value chain"),
      ]),
      domain("guiding-principles", "Understand Guiding Principles", 15, [
        obj("GP-1", "Apply ITIL guiding principles"),
        obj("GP-2", "Focus on value and start where you are"),
      ]),
      domain("four-dimensions", "Understand Four Dimensions of Service Management", 15, [
        obj("FD-1", "Organizations and people dimension"),
        obj("FD-2", "Information, technology, partners, and processes"),
      ]),
      domain("service-value-system", "Understand the Service Value System", 20, [
        obj("SV-1", "Describe governance and continual improvement"),
        obj("SV-2", "Explain service value chain activities"),
      ]),
      domain("practices", "Understand Key ITIL Practices", 35, [
        obj("PA-1", "Incident, problem, and change management"),
        obj("PA-2", "Service level and configuration management"),
        obj("PA-3", "Continual improvement and monitoring"),
        obj("PA-4", "Relationship and workforce practices"),
      ]),
    ],
  },
];

for (const bp of blueprints) {
  const full = {
    slug: bp.slug,
    examCode: bp.examCode,
    name: bp.name,
    provider: bp.provider,
    officialGuideUrl: bp.officialGuideUrl,
    lastReviewed: LAST_REVIEWED,
    questionsTarget: TARGET,
    difficultyMix: MIX,
    referenceUrls: bp.referenceUrls,
    domains: bp.domains,
  };
  writeFileSync(join(outDir, `${bp.slug}.json`), JSON.stringify(full, null, 2));
  console.log(`Wrote ${bp.slug}.json`);
}

console.log(`\nGenerated ${blueprints.length} blueprint files.`);
