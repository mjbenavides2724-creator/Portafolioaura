import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const dbCache: { [key: string]: string } = {};

  // Helper to find database recursively based on preferred page name
  async function findDatabaseWithinBlocks(blockId: string, preferredPageName: string): Promise<string | null> {
    const cacheKey = `${blockId}-${preferredPageName}`;
    if (dbCache[cacheKey]) return dbCache[cacheKey];

    const pageResponse = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28"
      }
    });
    const pageData = await pageResponse.json();
    const results = pageData.results || [];
    
    // 1. Look for direct database
    const databases = results.filter((b: any) => b.type === "child_database");
    if (databases.length > 0) {
      dbCache[cacheKey] = databases[0].id;
      return databases[0].id;
    }
    
    // 2. Look inside child pages. 
    const pages = results.filter((b: any) => b.type === "child_page");
    
    const targetPage = pages.find((b: any) => b.child_page?.title?.toUpperCase().includes(preferredPageName));
    if (targetPage) {
      const foundDbId = await findDatabaseWithinBlocks(targetPage.id, preferredPageName);
      if (foundDbId) {
        dbCache[cacheKey] = foundDbId;
        return foundDbId;
      }
    }
    
    for (const page of pages) {
      if (targetPage && page.id === targetPage.id) continue; // Already checked
      const foundDbId = await findDatabaseWithinBlocks(page.id, preferredPageName);
      if (foundDbId) {
        dbCache[cacheKey] = foundDbId;
        return foundDbId;
      }
    }
    
    return null;
  }

  // API routes before vite middleware
  // PERMANENT SYNC: This route must always fetch fresh data from Notion without caching
  app.get("/api/projects", async (req, res) => {
    try {
      const dbId = await findDatabaseWithinBlocks(process.env.NOTION_DATABASE_ID as string, "PROYECTO");
      
      if (!dbId) {
        return res.status(404).json({ error: "Database not found deeply in Notion." });
      }
      
      // Query the database
      const dbResponse = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      });
      
      const dbData = await dbResponse.json();
      
      // Map to simpler format for frontend
      const projects = dbData.results.map((item: any) => {
        const props = item.properties;
        
        const getText = (prop: any) => {
          if (prop?.title) return prop.title.map((rt: any) => rt.plain_text).join("");
          if (prop?.rich_text) return prop.rich_text.map((rt: any) => rt.plain_text).join("");
          return "";
        };

        const header = getText(props['NUMERO Y FECHA']).trim();
        const title = getText(props['TITULO']).trim();
        const desc = getText(props['TEXTO']).trim();
        const software = getText(props['PROGAMA 1']).trim(); // Note missing 'R' as per user screenshot
        const buttonText = getText(props['Nombre']).trim() || "VER PROYECTO";
        
        // Also get images dynamically from all Archivos columns just in case
        let allImages: string[] = [];
        for (let i = 1; i <= 5; i++) {
            const colName = i === 1 ? 'Archivos y multimedia' : `Archivos y multimedia ${i-1}`;
            const files = props[colName]?.files || [];
            allImages = allImages.concat(files.map((f: any) => f.file?.url || f.external?.url).filter(Boolean));
        }
        
        const imageUrl = allImages.length > 0 
          ? allImages[0]
          : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop";
          
        if (allImages.length === 0) {
          allImages.push(imageUrl);
        }
        
        const tags = [];
        // Solo mostrar el programa como solicitó el usuario, sin la columna 'Seleccionar'
        if (software) {
           tags.push(software);
        }
        
        // Loop through the new grouped scheme
        const projectPages = [];
        
        // Let's assume up to 5 variations possible per row
        for (let i = 1; i <= 5; i++) {
            const groupTitleRaw = getText(props[`Titulo proyecto ${i}`]).trim();
            const colName = i === 1 ? 'Archivos y multimedia' : `Archivos y multimedia ${i-1}`;
            
            const groupFiles = props[colName]?.files || [];
            
            const groupImages = groupFiles.map((fileObj: any) => fileObj.file?.url || fileObj.external?.url).filter(Boolean);
            
            if (groupTitleRaw || groupImages.length > 0) {
                const parts = groupTitleRaw.split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
                
                projectPages.push({
                    number: parts[0] || '',
                    title: parts[1] || '',
                    description: parts.slice(2).join('\n\n') || '',
                    text: groupTitleRaw,
                    imageUrl: groupImages.length > 0 ? groupImages[0] : imageUrl,
                    images: groupImages.length > 0 ? groupImages : [imageUrl]
                });
            }
        }
        
        // If a project doesn't have 'Titulo proyecto 1' filled out, BUT it has images, guarantee slides
        if (projectPages.length === 0) {
            projectPages.push({
                number: header.split('/')[0]?.trim() || '',
                title: title,
                description: desc,
                text: title,
                imageUrl: imageUrl,
                images: allImages.length > 0 ? allImages : [imageUrl]
            });
        }
        
        return {
          id: item.id,
          header: header,
          title: title,
          description: desc,
          tags: tags,
          imageUrl: imageUrl,
          images: allImages,
          projectPages: projectPages,
          buttonText: buttonText
        };
      });
      
      // Sort projects consistently by header string (e.g., 001, 002)
      projects.sort((a, b) => a.header.localeCompare(b.header));
      
      res.json(projects);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/quote", async (req, res) => {
    try {
      const dbId = await findDatabaseWithinBlocks(process.env.NOTION_DATABASE_ID as string, "INICIO");
      
      if (!dbId) {
        return res.status(404).json({ error: "Database not found deeply in Notion INICIO section." });
      }
      
      const dbResponse = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      });
      
      const dbData = await dbResponse.json();
      
      if (!dbData.results || dbData.results.length === 0) {
        return res.json(null);
      }

      const getText = (prop: any) => {
        if (!prop || !prop.rich_text) return "";
        return prop.rich_text.map((t: any) => t.plain_text).join("");
      };

      // Collect all available quotes from both columns across all rows
      const allQuotes: string[] = [];
      
      for (const row of dbData.results) {
        const fraseText = getText(row.properties["Frase"]).trim();
        const textoText = getText(row.properties["Texto"]).trim();
        
        if (fraseText) allQuotes.push(fraseText);
        if (textoText) allQuotes.push(textoText);
      }

      if (allQuotes.length === 0) {
        return res.json(null);
      }

      // Pick ONE random phrase from the combined pool - NO LONGER ON SERVER
      // const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      // res.json({ phrase: randomQuote });

      // Return the full pool so client can manage refresh logic and updates
      res.json({ quotes: allQuotes });
      
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  app.get("/api/autor", async (req, res) => {
    try {
      const rootId = process.env.NOTION_DATABASE_ID as string;
      const cacheKey = `autor-dbs-${rootId}`;
      let autorDbs = dbCache[cacheKey] as any;

      if (!autorDbs) {
        // Find AUTOR page
        const pageResponse = await fetch(`https://api.notion.com/v1/blocks/${rootId}/children`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28"
          }
        });
        const pageData = await pageResponse.json();
        const autorPage = (pageData.results || []).find((b: any) => b.type === "child_page" && b.child_page?.title?.toUpperCase().includes("AUTOR"));
        
        if (!autorPage) {
          return res.status(404).json({ error: "Autor page not found" });
        }

        const autorBlocksResp = await fetch(`https://api.notion.com/v1/blocks/${autorPage.id}/children`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28"
          }
        });
        const autorBlocks = await autorBlocksResp.json();
        const databases = (autorBlocks.results || []).filter((b: any) => b.type === "child_database");
        
        autorDbs = databases.map((db: any) => db.id);
        dbCache[cacheKey] = autorDbs;
      }

      if (!autorDbs || autorDbs.length < 3) {
        return res.status(404).json({ error: "Could not find all 3 databases in AUTOR page" });
      }

      const queryDb = async (id: string) => {
        const response = await fetch(`https://api.notion.com/v1/databases/${id}/query`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
          }
        });
        return (await response.json()).results || [];
      };

      const [db1, db2, db3] = await Promise.all([
        queryDb(autorDbs[0]),
        queryDb(autorDbs[1]),
        queryDb(autorDbs[2])
      ]);

      const getText = (prop: any) => {
        if (!prop || (!prop.rich_text && !prop.title)) return "";
        const arr = prop.rich_text || prop.title;
        return arr.map((t: any) => t.plain_text).join("");
      };

      // Profile (DB 1)
      const profileRow = db1[0];
      const getImageUrl = (row: any) => {
        if (!row) return null;
        if (row.cover) {
          return row.cover.type === 'external' ? row.cover.external.url : row.cover.file.url;
        }
        
        // Fallback: Check if there's any property of type 'files' with an image
        if (row.properties) {
          for (const key of Object.keys(row.properties)) {
            const prop = row.properties[key];
            if (prop && prop.type === 'files' && prop.files && prop.files.length > 0) {
              const fileObj = prop.files[0];
              return fileObj.type === 'external' ? fileObj.external.url : (fileObj.file ? fileObj.file.url : null);
            }
          }
        }
        
        return null;
      };

      const profile = profileRow ? {
        title: getText(profileRow.properties["TÍTULO"]),
        text: getText(profileRow.properties["Texto"]),
        photo: getImageUrl(profileRow)
      } : null;

      // Archive / Data (DB 2)
      const archive = db2.map((row: any) => ({
        id: row.id,
        name: getText(row.properties["Nombre"]),
        info1: getText(row.properties["Información"]),
        info2: getText(row.properties["información 2"] || row.properties["Información 2"])
      }));

      // Contact (DB 3)
      const contact = db3.map((row: any) => ({
        id: row.id,
        name: getText(row.properties["Nombre"]),
        text: getText(row.properties["Texto"])
      }));

      res.json({ profile, archive, contact });

    } catch (error: any) {
      console.error("Error fetching autor:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
