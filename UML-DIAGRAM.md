# Financial Analyzer Application - UML Diagram

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend - Next.js Application"
        subgraph "Pages"
            HomePage["/ (Home Page)"]
            LoadingPage["/loading (Loading Page)"]
            ResultsPage["/results (Results Page)"]
        end
        
        subgraph "Components"
            FileUpload["FileUpload Component"]
            FloatingParticle["FloatingParticle Component"]
            NoiseBackground["NoiseBackground Component"]
            CanvasRevealEffect["CanvasRevealEffect Component"]
        end
        
        subgraph "State Management"
            UploadStore["useUploadStore<br/>(Zustand)"]
        end
        
        subgraph "API Layer"
            NextAPIRoute["/api/analyze<br/>(Next.js API Route)"]
            APIClient["lib/api.js<br/>(analyzeDocument)"]
        end
        
        subgraph "Utilities"
            Utils["lib/utils.js<br/>(cn function)"]
        end
    end
    
    subgraph "Backend - Express Server"
        ExpressServer["Express Server<br/>(server.js)"]
        
        subgraph "Routes"
            HealthRoute["GET /<br/>(Health Check)"]
            AnalyzeRoute["POST /analyze<br/>(File Analysis)"]
        end
        
        subgraph "Middleware"
            Multer["Multer<br/>(File Upload)"]
            CORS["CORS"]
        end
        
        subgraph "Parsers"
            XLSXParser["parseXlsx.js<br/>(Excel Parser)"]
            DOCXParser["parseDocx.js<br/>(Word Parser)"]
        end
        
        subgraph "AI Integration"
            GPTOneShot["gptOneShot.js<br/>(OpenAI Integration)"]
        end
        
        subgraph "Feature Computation"
            ComputeFeatures["computeFeatures.js<br/>(Financial Analysis)"]
        end
        
        subgraph "Backend Utils"
            BackendUtils["utils.js"]
        end
    end
    
    subgraph "External Services"
        OpenAI["OpenAI API<br/>(GPT-4.1)"]
    end
    
    subgraph "Data Flow"
        File["Excel/Word File<br/>(Bank Statement)"]
    end
    
    %% User interactions
    User["User"] --> HomePage
    HomePage --> FileUpload
    FileUpload --> UploadStore
    UploadStore --> LoadingPage
    LoadingPage --> APIClient
    APIClient --> NextAPIRoute
    ResultsPage --> UploadStore
    
    %% Frontend internal flow
    HomePage --> NoiseBackground
    LoadingPage --> FloatingParticle
    LoadingPage --> CanvasRevealEffect
    
    %% API flow
    NextAPIRoute --> ExpressServer
    ExpressServer --> Multer
    Multer --> AnalyzeRoute
    AnalyzeRoute --> XLSXParser
    AnalyzeRoute --> DOCXParser
    XLSXParser --> ComputeFeatures
    DOCXParser --> ComputeFeatures
    AnalyzeRoute --> GPTOneShot
    GPTOneShot --> OpenAI
    ComputeFeatures --> AnalyzeRoute
    AnalyzeRoute --> NextAPIRoute
    NextAPIRoute --> APIClient
    APIClient --> LoadingPage
    LoadingPage --> ResultsPage
    
    %% File input
    User --> File
    File --> FileUpload
    
    %% Styling
    classDef frontend fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef backend fill:#10b981,stroke:#059669,color:#fff
    classDef external fill:#f59e0b,stroke:#d97706,color:#fff
    classDef data fill:#8b5cf6,stroke:#7c3aed,color:#fff
    
    class HomePage,LoadingPage,ResultsPage,FileUpload,FloatingParticle,NoiseBackground,CanvasRevealEffect,UploadStore,NextAPIRoute,APIClient,Utils frontend
    class ExpressServer,HealthRoute,AnalyzeRoute,Multer,CORS,XLSXParser,DOCXParser,GPTOneShot,ComputeFeatures,BackendUtils backend
    class OpenAI external
    class File,User data
```

## Component Class Diagram

```mermaid
classDiagram
    class Frontend {
        +Next.js 14.x
        +React 18.x
        +Tailwind CSS
        +Framer Motion
    }
    
    class HomePage {
        +FileUpload component
        +NoiseBackground component
        +handleFileUpload()
        +navigateToLoading()
    }
    
    class LoadingPage {
        +FloatingParticle components
        +Progress bar
        +Loading messages
        +analyzeDocument()
        +showError()
    }
    
    class ResultsPage {
        +Credit Score display
        +Income vs Spending chart
        +BNPL Exposure chart
        +Monthly Balance Trend
        +Financial Summary
        +AI Summary
    }
    
    class FileUpload {
        +handleFileSelect()
        +validateFile()
        +uploadFile()
    }
    
    class UploadStore {
        +file: File
        +results: Object
        +isAnalyzing: boolean
        +setFile()
        +setResults()
        +setIsAnalyzing()
    }
    
    class APIClient {
        +analyzeDocument(file)
        +handleErrors()
    }
    
    class ExpressServer {
        +app: Express
        +PORT: 7860
        +handleFileUpload()
        +processAnalysis()
    }
    
    class XLSXParser {
        +parseXlsx(buffer)
        +excelDateToJSDate(serial)
        +formatDate(date)
        +extractAmountFromDescription()
        +detectColumns()
    }
    
    class DOCXParser {
        +parseDocx(buffer)
        +extractText()
    }
    
    class GPTOneShot {
        +extractFinancialData()
        +callOpenAI()
        +parseResponse()
    }
    
    class ComputeFeatures {
        +computeFeatures(transactions)
        +parseDate(dateStr)
        +monthKey(dateStr)
        +computeSpendingSpeed()
        +calculateScore()
    }
    
    Frontend --> HomePage
    Frontend --> LoadingPage
    Frontend --> ResultsPage
    HomePage --> FileUpload
    HomePage --> UploadStore
    LoadingPage --> APIClient
    LoadingPage --> UploadStore
    ResultsPage --> UploadStore
    APIClient --> ExpressServer
    ExpressServer --> XLSXParser
    ExpressServer --> DOCXParser
    ExpressServer --> ComputeFeatures
    ExpressServer --> GPTOneShot
    GPTOneShot --> OpenAI
    XLSXParser --> ComputeFeatures
    DOCXParser --> ComputeFeatures
```

## Data Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant HomePage
    participant FileUpload
    participant UploadStore
    participant LoadingPage
    participant APIClient
    participant NextAPIRoute
    participant ExpressServer
    participant XLSXParser
    participant ComputeFeatures
    participant GPTOneShot
    participant OpenAI
    participant ResultsPage
    
    User->>HomePage: Upload Bank Statement
    HomePage->>FileUpload: Select File
    FileUpload->>UploadStore: setFile(file)
    UploadStore->>LoadingPage: Navigate to /loading
    LoadingPage->>APIClient: analyzeDocument(file)
    APIClient->>NextAPIRoute: POST /api/analyze
    NextAPIRoute->>ExpressServer: Forward to backend
    ExpressServer->>XLSXParser: Parse Excel file
    XLSXParser->>XLSXParser: Extract transactions
    XLSXParser->>XLSXParser: Extract amounts from descriptions
    XLSXParser-->>ExpressServer: Return transactions array
    ExpressServer->>ComputeFeatures: Compute financial features
    ComputeFeatures->>ComputeFeatures: Calculate income/expenses
    ComputeFeatures->>ComputeFeatures: Calculate BNPL exposure
    ComputeFeatures->>ComputeFeatures: Calculate credit score
    ComputeFeatures-->>ExpressServer: Return features & score
    ExpressServer->>GPTOneShot: Extract AI insights
    GPTOneShot->>OpenAI: Call GPT-4.1 API
    OpenAI-->>GPTOneShot: Return AI analysis
    GPTOneShot-->>ExpressServer: Return insights
    ExpressServer-->>NextAPIRoute: Return complete results
    NextAPIRoute-->>APIClient: Return JSON response
    APIClient-->>LoadingPage: Return results
    LoadingPage->>UploadStore: setResults(results)
    UploadStore->>ResultsPage: Navigate to /results
    ResultsPage->>User: Display analysis results
```

## Database/State Structure

```mermaid
erDiagram
    UPLOAD_STORE ||--o{ FILE : contains
    UPLOAD_STORE ||--o{ RESULTS : contains
    
    FILE {
        string name
        number size
        string type
        blob data
    }
    
    RESULTS {
        number score
        object features
        string summary
        array transactions
    }
    
    FEATURES {
        number totalIncome
        number totalExpenses
        number savingsRatio
        number bnplRatio
        number incomeStability
        number spendingVolatility
        object monthlyBalances
        object bnplBreakdown
    }
    
    TRANSACTION {
        string date
        string description
        number amount
        string category
        string type
    }
    
    RESULTS ||--|| FEATURES : has
    RESULTS ||--o{ TRANSACTION : contains
```

## Technology Stack Diagram

```mermaid
graph LR
    subgraph "Frontend Stack"
        NextJS["Next.js 14"]
        React["React 18"]
        Tailwind["Tailwind CSS"]
        FramerMotion["Framer Motion"]
        Zustand["Zustand"]
    end
    
    subgraph "Backend Stack"
        Express["Express.js"]
        Multer["Multer"]
        XLSX["xlsx library"]
        Mammoth["mammoth library"]
        DotEnv["dotenv"]
    end
    
    subgraph "AI/ML"
        OpenAI["OpenAI SDK"]
        GPT["GPT-4.1"]
    end
    
    subgraph "Development"
        NodeJS["Node.js"]
        NPM["npm"]
        Concurrently["concurrently"]
    end
    
    NextJS --> React
    NextJS --> Tailwind
    React --> FramerMotion
    React --> Zustand
    Express --> Multer
    Express --> XLSX
    Express --> Mammoth
    Express --> DotEnv
    Express --> OpenAI
    OpenAI --> GPT
    NextJS --> NodeJS
    Express --> NodeJS
```

## File Structure Tree

```mermaid
graph TD
    Root["frontend/"]
    
    Root --> App["app/"]
    Root --> Components["components/"]
    Root --> Lib["lib/"]
    Root --> Backend["backend/"]
    Root --> Public["public/"]
    
    App --> Home["page.jsx"]
    App --> Loading["loading/page.jsx"]
    App --> Results["results/page.jsx"]
    App --> APIRoute["api/analyze/route.js"]
    App --> Layout["layout.jsx"]
    App --> Globals["globals.css"]
    
    Components --> UI["ui/"]
    UI --> FileUpload["file-upload.jsx"]
    UI --> FloatingParticle["floating-particle.jsx"]
    UI --> NoiseBackground["noise-background.jsx"]
    UI --> CanvasRevealEffect["canvas-reveal-effect.jsx"]
    
    Lib --> API["api.js"]
    Lib --> Utils["utils.js"]
    
    Backend --> Server["server.js"]
    Backend --> Helpers["helpers/"]
    Backend --> Env[".env"]
    Backend --> PackageJSON["package.json"]
    
    Helpers --> ParseXLSX["parseXlsx.js"]
    Helpers --> ParseDOCX["parseDocx.js"]
    Helpers --> GPTOneShot["gptOneShot.js"]
    Helpers --> ComputeFeatures["computeFeatures.js"]
    Helpers --> UtilsBackend["utils.js"]
```

