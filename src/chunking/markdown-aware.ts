import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface ParentChunk {
  id: string;
  content: string;
  source: string;
  title: string;
}

export interface MarkdownChunkResult {
  childChunks: Document[];
  parentMap: Map<string, ParentChunk>;
}

function splitByH2(content: string): { heading: string; body: string }[] {
  const lines = content.split('\n');
  const sections: { heading: string; body: string }[] = [];
  let currentHeading = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentBody.length > 0) {
        sections.push({
          heading: currentHeading,
          body: currentBody.join('\n').trim(),
        });
      }
      currentHeading = line.slice(3).trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentBody.length > 0) {
    sections.push({
      heading: currentHeading,
      body: currentBody.join('\n').trim(),
    });
  }

  return sections.filter((s) => s.body.length > 50);
}

export async function createMarkdownAwareChunks(
  rawDocs: { content: string; source: string; title: string }[]
): Promise<MarkdownChunkResult> {
  const parentMap = new Map<string, ParentChunk>();
  const childChunks: Document[] = [];
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 30,
  });

  for (const doc of rawDocs) {
    const sections = splitByH2(doc.content);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const parentId = `${doc.source}#section-${i}`;

      // 父块：整个 H2 section
      parentMap.set(parentId, {
        id: parentId,
        content: section.heading
          ? `# ${section.heading}\n\n${section.body}`
          : section.body,
        source: doc.source,
        title: doc.title,
      });

      // 子块：section 内部按 ~300 字切分
      const splits = await splitter.createDocuments(
        [section.body],
        [
          {
            source: doc.source,
            title: doc.title,
            parentId,
            sectionHeading: section.heading,
          },
        ]
      );
      childChunks.push(...splits);
    }
  }

  return { childChunks, parentMap };
}
