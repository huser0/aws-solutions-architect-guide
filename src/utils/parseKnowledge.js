/**
 * Parses the knowledge.md file into structured modules
 * Each H2 (##) becomes a module, each H3 (###) becomes a section
 * Lines that are between H3 sections and the next H2/H3 become a "general" section.
 */
export function parseKnowledge(markdown) {
  const lines = markdown.split('\n');
  const modules = [];
  let currentModule = null;
  let currentSection = null;
  let contentBuffer = [];

  const flushSection = () => {
    if (currentSection && contentBuffer.length > 0) {
      currentSection.content = contentBuffer.join('\n').trim();
      contentBuffer = [];
    }
  };

  const flushModule = () => {
    flushSection();
    if (currentSection && currentModule) {
      currentModule.sections.push(currentSection);
      currentSection = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      continue;
    }

    if (line.startsWith('## ')) {
      if (currentModule) {
        flushModule();
        modules.push(currentModule);
      }
      const title = line.replace('## ', '').trim();
      currentModule = {
        id: slugify(title),
        title,
        sections: [],
      };
      continue;
    }

    if (line.startsWith('### ')) {
      if (currentModule) {
        flushSection();
        if (currentSection) {
          currentModule.sections.push(currentSection);
        }
        const title = line.replace('### ', '').trim();
        currentSection = {
          id: slugify(title),
          title,
          content: '',
        };
      }
      continue;
    }

    if (currentSection) {
      contentBuffer.push(line);
    }
  }

  if (currentModule) {
    flushModule();
    modules.push(currentModule);
  }

  return modules.filter(m => m.sections.length > 0);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
