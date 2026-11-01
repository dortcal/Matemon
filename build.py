import re
css=open('src/style.css').read()
js='\n'.join(open('src/'+f).read() for f in ['questions.js','creatures.js','audio.js','fx.js','game.js'])
t=open('src/index.tpl.html').read()
out=t.replace('/*CSS*/',css).replace('/*JS*/',js.replace('</script>','<\\/script>'))
open('index.html','w').write(out)
print(len(out)//1024,'KB')
