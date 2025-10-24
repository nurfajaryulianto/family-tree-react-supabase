flowchart TD
    Start[Start] --> Auth[Authentication]
    Auth --> Login[Login Page]
    Auth --> Register[Registration Page]
    Login --> Dashboard[User Dashboard]
    Register --> Dashboard
    Dashboard --> Tree[Family Tree Viewer]
    Tree --> Node[Member Node]
    Node --> Menu[Radial Menu]
    Menu --> AddDialog[Add Relative Dialog]
    AddDialog --> Form[Member Form]
    Form --> Submit[Submit New Member]
    Submit --> Database[Supabase Database]
    Database --> Update[Real Time Update]
    Update --> Tree