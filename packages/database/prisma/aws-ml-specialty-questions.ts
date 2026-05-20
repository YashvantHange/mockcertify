/**
 * AWS Certified Machine Learning – Specialty (MLS-C01) practice questions.
 * Domain weights align with the official exam blueprint.
 */
import type { Difficulty } from "./seed-data";

export interface MlQuestion {
  domainSlug: string;
  difficulty: Difficulty;
  title: string;
  description?: string;
  options: { key: string; text: string; isCorrect: boolean }[];
  explanation: string;
  tags: string[];
}

const refs = [
  "https://docs.aws.amazon.com/sagemaker/",
  "https://docs.aws.amazon.com/machine-learning/",
  "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
];

function q(
  domainSlug: string,
  difficulty: Difficulty,
  title: string,
  description: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  tags: string[] = []
): MlQuestion {
  const keys = ["A", "B", "C", "D"] as const;
  return {
    domainSlug,
    difficulty,
    title,
    description,
    options: options.map((text, i) => ({
      key: keys[i],
      text,
      isCorrect: i === correctIndex,
    })),
    explanation,
    tags: ["aws-ml-specialty", domainSlug, ...tags],
  };
}

export const awsMlSpecialtyQuestions: MlQuestion[] = [
  // —— Data Engineering ——
  q(
    "data-engineering",
    "EASY",
    "Which S3 storage class is most cost-effective for ML training data accessed frequently?",
    "You store terabytes of labeled images for iterative model training in SageMaker.",
    [
      "S3 Standard for frequent access to training datasets",
      "S3 Glacier Deep Archive for all training data",
      "S3 One Zone-IA for multi-AZ resilience",
      "S3 Intelligent-Tiering Archive Access tier only",
    ],
    0,
    "S3 Standard suits frequently accessed training data. Glacier tiers are for archival; One Zone-IA sacrifices AZ resilience.",
    ["s3", "storage"]
  ),
  q(
    "data-engineering",
    "MEDIUM",
    "How should you ingest streaming clickstream data for near-real-time feature computation?",
    "A recommendation team needs sub-minute feature updates.",
    [
      "Amazon Kinesis Data Streams with consumers updating SageMaker Feature Store",
      "Weekly AWS DataSync from on-premises NFS only",
      "Amazon S3 batch operations every 24 hours",
      "Manual CSV uploads to SageMaker Notebook Instances",
    ],
    0,
    "Kinesis Data Streams enables real-time ingestion; consumers can materialize features into the Feature Store.",
    ["kinesis", "feature-store"]
  ),
  q(
    "data-engineering",
    "MEDIUM",
    "Which service transforms and catalogs data for ML pipelines at scale?",
    "Your data science team needs ETL, schema discovery, and a central catalog.",
    [
      "AWS Glue with crawlers and the Data Catalog",
      "Amazon EC2 Auto Scaling groups only",
      "AWS CloudFormation stack sets",
      "Amazon Route 53 health checks",
    ],
    0,
    "AWS Glue provides serverless ETL and integrates with the Glue Data Catalog for discovery.",
    ["glue", "etl"]
  ),
  q(
    "data-engineering",
    "HARD",
    "You must join 500 GB of historical orders (Parquet on S3) with streaming events. What architecture minimizes cost?",
    "Queries are ad hoc during exploration; training uses batch exports.",
    [
      "Land streaming events to S3 via Kinesis Data Firehose; use Athena/Glue for SQL joins over S3",
      "Load all history into a single SageMaker notebook local disk",
      "Store everything in Amazon RDS Multi-AZ with 10 TB gp3",
      "Replicate streams only to ElastiCache for joins",
    ],
    0,
    "Firehose delivers streaming data to S3; Athena and Glue query large Parquet datasets cost-effectively.",
    ["athena", "firehose", "parquet"]
  ),
  q(
    "data-engineering",
    "MEDIUM",
    "What is the purpose of SageMaker Feature Store?",
    "Teams need consistent online and offline features for training and inference.",
    [
      "Central repository for feature definitions with online low-latency and offline batch retrieval",
      "Replace S3 for all raw data storage",
      "Host Jupyter notebooks only",
      "Manage IAM users for data scientists",
    ],
    0,
    "Feature Store provides a single source of truth for features across training and real-time inference.",
    ["feature-store"]
  ),

  // —— Exploratory Data Analysis ——
  q(
    "exploratory-analysis",
    "EASY",
    "Which metric is most appropriate for a heavily imbalanced fraud detection dataset?",
    "Only 0.3% of transactions are fraudulent.",
    [
      "Precision-recall and F1 score rather than accuracy alone",
      "Accuracy only",
      "R-squared from linear regression",
      "Mean absolute percentage error",
    ],
    0,
    "Accuracy is misleading with class imbalance; precision, recall, and F1 better reflect model quality.",
    ["metrics", "imbalanced-data"]
  ),
  q(
    "exploratory-analysis",
    "MEDIUM",
    "You observe severe multicollinearity among numeric features. What should you try first?",
    "Linear models show unstable coefficients.",
    [
      "Remove or combine correlated features, or use regularization / tree-based models",
      "Increase learning rate to maximum",
      "Add duplicate copies of the same feature",
      "Disable cross-validation",
    ],
    0,
    "Address multicollinearity via feature selection, PCA, regularization, or models robust to correlated inputs.",
    ["statistics", "feature-engineering"]
  ),
  q(
    "exploratory-analysis",
    "MEDIUM",
    "Which SageMaker tool helps visualize experiments, metrics, and artifacts?",
    "Multiple training jobs run with different hyperparameters.",
    [
      "Amazon SageMaker Experiments and SageMaker Studio",
      "AWS Budgets",
      "Amazon CloudWatch Logs Insights only",
      "AWS Artifact",
    ],
    0,
    "SageMaker Experiments tracks runs; Studio provides visualization and comparison.",
    ["studio", "experiments"]
  ),
  q(
    "exploratory-analysis",
    "HARD",
    "A dataset has 40% missing values in a critical column. What is a sound approach before modeling?",
    "Missingness is not random; dropping rows loses signal.",
    [
      "Analyze missingness patterns, impute with domain-aware methods or model-based imputation, document assumptions",
      "Replace all missing values with zero without analysis",
      "Delete the entire dataset",
      "Duplicate rows until missingness disappears",
    ],
    0,
    "Understand MNAR/MAR/MCAR patterns before choosing imputation or missing-indicator features.",
    ["data-quality", "imputation"]
  ),
  q(
    "exploratory-analysis",
    "EASY",
    "What does a confusion matrix show for a binary classifier?",
    "You need TP, FP, TN, and FN counts.",
    [
      "Counts of true positive, false positive, true negative, and false negative predictions",
      "GPU utilization during training",
      "S3 bucket policy statements",
      "VPC subnet routing tables",
    ],
    0,
    "A confusion matrix tabulates prediction outcomes against actual labels for classification evaluation.",
    ["metrics", "classification"]
  ),

  // —— Modeling ——
  q(
    "modeling",
    "EASY",
    "Which SageMaker built-in algorithm is commonly used for gradient-boosted tabular classification?",
    "You have mixed numeric and categorical features on structured data.",
    [
      "XGBoost algorithm",
      "BlazingText for word embeddings only",
      "Object Detection for images",
      "Neural Topic Model for LDA only",
    ],
    0,
    "SageMaker's XGBoost container is widely used for structured classification and regression.",
    ["xgboost", "built-in-algorithms"]
  ),
  q(
    "modeling",
    "MEDIUM",
    "When should you use SageMaker Automatic Model Tuning (Bayesian optimization)?",
    "You have a limited budget to search hyperparameter space.",
    [
      "To efficiently search hyperparameters using past trial results to suggest better configurations",
      "To replace the need for a validation dataset",
      "To automatically label raw data",
      "To deploy models without endpoints",
    ],
    0,
    "Automatic Model Tuning uses Bayesian search to minimize expensive exhaustive grid searches.",
    ["hyperparameter-tuning", "automl"]
  ),
  q(
    "modeling",
    "MEDIUM",
    "What is transfer learning in the context of computer vision on SageMaker?",
    "You have a small labeled image set for defect detection.",
    [
      "Start from a pre-trained model (e.g., ResNet) and fine-tune on your dataset",
      "Train from random weights only with millions of images",
      "Use SQL joins on image bytes",
      "Export labels to Route 53",
    ],
    0,
    "Transfer learning leverages pre-trained weights to improve accuracy with limited labeled data.",
    ["computer-vision", "transfer-learning"]
  ),
  q(
    "modeling",
    "HARD",
    "You train a deep model on SageMaker with distributed data parallelism. Which instance strategy fits?",
    "Dataset is 10 TB; training must finish within SLA.",
    [
      "Use a SageMaker distributed training job with multiple GPU instances and data channels from S3",
      "Single ml.t2.micro with local CSV only",
      "Run training inside AWS Lambda without batching",
      "Store the dataset only in instance ephemeral storage without S3",
    ],
    0,
    "Distributed training on multi-GPU instances with S3 data channels scales large deep learning workloads.",
    ["distributed-training", "gpu"]
  ),
  q(
    "modeling",
    "MEDIUM",
    "Which loss function is typical for multi-class classification with softmax output?",
    "The model outputs probabilities across 50 product categories.",
    [
      "Cross-entropy loss",
      "Mean squared error on class indices",
      "Huber loss for regression",
      "Contrastive loss for siamese networks only",
    ],
    0,
    "Cross-entropy is standard for multi-class classification with softmax.",
    ["deep-learning", "loss-functions"]
  ),
  q(
    "modeling",
    "HARD",
    "A time-series forecasting model shows good training error but poor forecast on new weeks. What is likely wrong?",
    "Data includes promotions and seasonality.",
    [
      "Data leakage or inadequate validation that respects time order (need rolling-origin evaluation)",
      "Learning rate is too low only",
      "S3 versioning is disabled",
      "Feature Store is in online-only mode",
    ],
    0,
    "Time-series requires temporal splits; leakage from future features inflates training metrics.",
    ["time-series", "validation"]
  ),
  q(
    "modeling",
    "EASY",
    "What does SageMaker Linear Learner support out of the box?",
    "You need a fast baseline on large sparse numeric data.",
    [
      "Linear classification and regression with stochastic gradient descent",
      "Unsupervised image segmentation",
      "Reinforcement learning for robotics",
      "Graph neural networks",
    ],
    0,
    "Linear Learner is a built-in algorithm for linear classification and regression at scale.",
    ["linear-learner", "built-in-algorithms"]
  ),

  // —— ML Implementation and Operations ——
  q(
    "ml-operations",
    "EASY",
    "How do you deploy a model for real-time low-latency inference on SageMaker?",
    "Clients send HTTPS requests with JSON payloads.",
    [
      "Create a SageMaker real-time endpoint with an endpoint configuration",
      "Use only Batch Transform for all traffic",
      "Host the model in S3 and return presigned URLs",
      "Run inference on AWS Snowball Edge without endpoints",
    ],
    0,
    "Real-time endpoints provide persistent HTTPS inference with autoscaling options.",
    ["endpoints", "inference"]
  ),
  q(
    "ml-operations",
    "MEDIUM",
    "When is SageMaker Batch Transform appropriate?",
    "You must score 5 million records overnight without persistent traffic.",
    [
      "Large offline batch scoring jobs reading from S3 and writing predictions to S3",
      "Interactive sub-100ms API traffic",
      "Training new models from scratch only",
      "Streaming inference on Kinesis shards directly without containers",
    ],
    0,
    "Batch Transform processes large datasets asynchronously without maintaining an endpoint.",
    ["batch-transform"]
  ),
  q(
    "ml-operations",
    "MEDIUM",
    "Which capability helps detect data drift in production ML models?",
    "Feature distributions may shift after deployment.",
    [
      "Amazon SageMaker Model Monitor with baseline constraints and scheduled monitoring jobs",
      "AWS Trusted Advisor only",
      "IAM Access Analyzer",
      "Amazon Macie for S3 object classification only",
    ],
    0,
    "Model Monitor compares live data to baselines and can alert on drift violations.",
    ["model-monitor", "mlops"]
  ),
  q(
    "ml-operations",
    "HARD",
    "You need blue/green deployments for a SageMaker endpoint with minimal downtime. What do you use?",
    "A new model version must be validated before full traffic cutover.",
    [
      "Production variants with traffic shifting or SageMaker inference component updates per current best practices",
      "Delete the endpoint and recreate manually during peak traffic",
      "Store two models in the same S3 prefix without versioning",
      "Use CloudFront to cache training gradients",
    ],
    0,
    "SageMaker supports production variants and traffic splitting for safe rollout of new models.",
    ["deployment", "endpoints"]
  ),
  q(
    "ml-operations",
    "MEDIUM",
    "How should you secure training data and model artifacts in SageMaker?",
    "Compliance requires encryption and least-privilege access.",
    [
      "Encrypt S3 and EBS with KMS; use IAM roles for SageMaker execution; enable VPC configuration when needed",
      "Store credentials in notebook code cells",
      "Disable all logging for privacy",
      "Use root account access keys in training containers",
    ],
    0,
    "Use KMS encryption, IAM execution roles, and VPC interfaces; never embed long-lived keys in notebooks.",
    ["security", "kms", "iam"]
  ),
  q(
    "ml-operations",
    "EASY",
    "What is the role of Amazon ECR in a SageMaker workflow?",
    "You deploy a custom inference container.",
    [
      "Store Docker images for custom training and inference containers used by SageMaker",
      "Host Jupyter notebooks publicly",
      "Replace S3 for model weights",
      "Manage DNS records for endpoints",
    ],
    0,
    "ECR holds container images referenced by SageMaker training and hosting jobs.",
    ["ecr", "containers"]
  ),

  // —— Additional cross-domain questions ——
  q(
    "data-engineering",
    "MEDIUM",
    "Which format is commonly used for columnar analytics on S3 for ML feature pipelines?",
    "Athena and Spark jobs read training features.",
    [
      "Apache Parquet or ORC",
      "Uncompressed plain text only",
      "PNG images",
      "JSON lines without compression for 10 TB tables",
    ],
    0,
    "Parquet and ORC are columnar, compressed formats efficient for analytics and ML ETL.",
    ["parquet", "s3"]
  ),
  q(
    "modeling",
    "MEDIUM",
    "What is the purpose of early stopping during SageMaker training?",
    "Validation loss plateaus after epoch 8 of 50.",
    [
      "Halt training when validation metric stops improving to reduce overfitting and cost",
      "Stop when training accuracy reaches 50%",
      "Pause until manual approval in every epoch",
      "Disable checkpointing entirely",
    ],
    0,
    "Early stopping ends training when validation performance no longer improves.",
    ["training", "regularization"]
  ),
  q(
    "exploratory-analysis",
    "MEDIUM",
    "You need to detect outliers in high-dimensional sensor data before modeling. What helps?",
    "Some sensors report impossible readings.",
    [
      "Statistical rules, isolation forests, or robust scalers combined with domain thresholds",
      "Ignore outliers and never document them",
      "Multiply all readings by a constant",
      "Use only mean imputation without inspection",
    ],
    0,
    "Combine statistical and ML outlier detection with domain knowledge before training.",
    ["outliers", "preprocessing"]
  ),
  q(
    "ml-operations",
    "MEDIUM",
    "How can you reduce inference cost for a model with variable traffic?",
    "Traffic drops 80% at night.",
    [
      "Configure SageMaker endpoint auto scaling and consider multi-model endpoints or serverless inference where fit",
      "Use largest GPU instance 24/7",
      "Disable autoscaling and over-provision",
      "Run batch transform every minute for API clients",
    ],
    0,
    "Auto scaling and serverless or multi-model endpoints align capacity with demand.",
    ["cost-optimization", "autoscaling"]
  ),
  q(
    "modeling",
    "HARD",
    "Which approach best handles categorical high-cardinality features in tree models on SageMaker?",
    "Product SKU has 200,000 unique values.",
    [
      "Target encoding, frequency encoding, or hashing with cross-validation to avoid leakage; or use algorithms that handle high cardinality natively",
      "One-hot encode all SKUs creating 200k columns without regularization",
      "Drop the SKU column always",
      "Assign random integers 1–200000 as ordinals",
    ],
    0,
    "High-cardinality categoricals need careful encoding; naive one-hot or random ordinals hurts performance.",
    ["feature-engineering", "categorical"]
  ),
  q(
    "data-engineering",
    "EASY",
    "What does AWS Lake Formation help with for ML data lakes?",
    "Multiple teams query shared datasets on S3.",
    [
      "Centralized permissions and governance over data lakes built on S3 and Glue Catalog",
      "Train neural networks without SageMaker",
      "Replace Kinesis entirely",
      "Manage EC2 SSH keys",
    ],
    0,
    "Lake Formation simplifies fine-grained access control over S3 data lake resources.",
    ["lake-formation", "governance"]
  ),
  q(
    "exploratory-analysis",
    "EASY",
    "Why normalize numeric features before training many algorithms?",
    "Features use different scales (age vs income).",
    [
      "Stabilizes optimization and ensures features contribute fairly in distance-based and gradient methods",
      "Guarantees 100% accuracy",
      "Removes the need for validation data",
      "Encrypts data at rest",
    ],
    0,
    "Scaling prevents large-magnitude features from dominating learning.",
    ["normalization", "preprocessing"]
  ),
  q(
    "ml-operations",
    "HARD",
    "A model in production must explain individual predictions for compliance. What AWS option helps?",
    "Regulators require feature attributions per decision.",
    [
      "SageMaker Clarify for bias and explainability reports (SHAP, partial dependence) integrated into workflows",
      "CloudTrail only",
      "S3 Object Lock",
      "AWS WAF on the endpoint",
    ],
    0,
    "SageMaker Clarify provides explainability and bias detection for regulatory and fairness needs.",
    ["clarify", "explainability"]
  ),
  q(
    "modeling",
    "MEDIUM",
    "Which built-in SageMaker algorithm is suited for unsupervised customer segmentation?",
    "You have no labels, only purchase vectors.",
    [
      "K-Means clustering algorithm",
      "Object2Vec for sequence pairs",
      "Image classification",
      "Factorization Machines for click prediction only",
    ],
    0,
    "K-Means is a built-in option for clustering unlabeled data.",
    ["k-means", "unsupervised"]
  ),
  q(
    "data-engineering",
    "HARD",
    "You must version datasets and reproduce training runs exactly. What practices apply?",
    "Auditors need traceability from raw data to model artifact.",
    [
      "Version S3 objects, pin Glue job scripts, log SageMaker Experiments with input data hashes and git commit IDs",
      "Overwrite S3 prefixes in place without versioning",
      "Store only the final model without metadata",
      "Disable CloudWatch logs for training jobs",
    ],
    0,
    "Reproducibility requires versioned data, tracked code, and experiment metadata.",
    ["mlops", "reproducibility"]
  ),
];

export const awsMlReferenceLinks = refs;
