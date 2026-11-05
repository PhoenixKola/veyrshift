"""Tiny offline ES-module bundler for the preview graph only.
Not a replacement for Vite. Emits a single-file demo usable without npm or a server.
The preview includes ONLY locally authored code, not npm dependencies.
"""
from pathlib import Path
import re

root=Path('dist-preview')
entry=root/'src/preview/main.js'
modules=[]
visited=set()
imports=re.compile(r"^import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?\s*$",re.M)
exports=re.compile(r"\bexport\s+(?:class|function|const|let)\s+(\w+)")

def visit(path:Path):
 path=path.resolve()
 if path in visited:return
 visited.add(path)
 source=path.read_text(encoding='utf-8')
 for _,rel in imports.findall(source):visit((path.parent/rel).resolve())
 modules.append((path,source))
visit(entry)

out=['/* Project Veyrshift offline preview bundle: generated from same TypeScript game engine. */',"'use strict';",'(function(){','const __modules=Object.create(null);']
for path,src in modules:
 name=path.relative_to(root.resolve()).as_posix()
 dep_stmts=[]
 def replace_import(match):
  symbols=match.group(1).strip()
  dep=(path.parent/match.group(2)).resolve().relative_to(root.resolve()).as_posix()
  dep_stmts.append(f'const {{{symbols}}}=__modules[{dep!r}];')
  return ''
 src=imports.sub(replace_import,src)
 names=exports.findall(src)
 src=re.sub(r'\bexport\s+(?=class|function|const|let)', '', src)
 src=src.replace("import.meta.url.includes('preview')",'true')
 out += ['{', 'const __exports=Object.create(null);', *dep_stmts, src]
 for n in names:out.append(f'__exports[{n!r}]={n};')
 out += [f'__modules[{name!r}]=__exports;','}']
out+=['})();']
bundle='\n'.join(out)
(root/'standalone.js').write_text(bundle,encoding='utf-8')
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
# CSS Google Fonts import omitted; system fallbacks guarantee true offline operation.
css=re.sub(r'^@import[^\n]*\n', '', css)
html=html.replace('<link rel="stylesheet" href="./styles.css"/>',f'<style>{css}</style>')
html=html.replace('<script type="module" src="./src/preview/main.js"></script>',f'<script>{bundle}</script>')
(root/'standalone.html').write_text(html,encoding='utf-8')
print(f'Standalone preview built -> {root}/standalone.html ({len(bundle):,} JS chars, {len(modules)} modules)')
