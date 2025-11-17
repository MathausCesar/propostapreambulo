# 🚀 DEPLOY NO NETLIFY - PASSO A PASSO

## ✅ Build Criado com Sucesso!

A pasta `dist` foi criada com todos os arquivos necessários para produção.

## 📋 **DEPLOY MANUAL NO NETLIFY (MAIS SIMPLES)**

### Passo 1: Acesse o Netlify
1. Vá para [netlify.com](https://netlify.com)
2. Faça login ou crie uma conta gratuita

### Passo 2: Deploy por Drag & Drop
1. Na página principal do Netlify, procure por **"Want to deploy a new site without connecting to Git?"**
2. Clique em **"Browse to upload"**
3. Navegue até a pasta: `c:\Users\mathaus.cesar\OneDrive - Preâmbulo Informática Ltda\Área de Trabalho\apps\proposta\dist`
4. **Arraste a pasta `dist` inteira** para a área de upload
5. Aguarde o upload e processamento

### Passo 3: Configurar URL Personalizada (Opcional)
1. Após o deploy, clique em **"Site settings"**
2. Em **"Domain Management"** → **"Options"** → **"Edit site name"**
3. Mude para: `propostas-preambulo` ou outro nome de sua escolha
4. Sua URL será: `https://propostas-preambulo.netlify.app`

### Passo 4: Configurar Redirects
1. No Netlify, vá em **"Site settings"** → **"Build & deploy"** → **"Redirects and headers"**
2. Clique em **"Add rule"**
3. Adicione:
   - **From:** `/*`
   - **To:** `/index.html`
   - **Status:** `200`
4. Isso garante que o React Router funcione corretamente

## 🔄 **ATUALIZAÇÕES FUTURAS**

Quando fizer mudanças no código:
1. Execute: `npm run build`
2. Vá no Netlify → **"Deploys"** → **"Drag and drop your site output folder here"**
3. Arraste a nova pasta `dist`

## 📱 **TESTANDO O SISTEMA DE USUÁRIOS**

1. Acesse sua URL do Netlify
2. Crie um usuário (ex: "joao.silva", "João Silva")
3. Abra uma aba anônima/privada
4. Acesse a mesma URL
5. Crie outro usuário (ex: "maria.santos", "Maria Santos")
6. Verifique que cada um vê apenas suas próprias propostas!

## 🛡️ **COMO ORIENTAR SEU TIME**

### Para cada pessoa da equipe:
1. **Compartilhe a URL:** `https://sua-url.netlify.app`
2. **Primeira vez:** Cada um cria seu usuário único
3. **Login:** Usar sempre o mesmo ID (ex: nome.sobrenome)
4. **Backup:** Fazer download semanal dos dados
5. **Segurança:** Dados ficam no navegador de cada um

### Exemplo de IDs recomendados:
- joao.silva
- maria.santos  
- carlos.oliveira
- ana.costa

## 🔧 **COMANDOS ÚTEIS**

```bash
# Para rebuild e redeploy
npm run build

# Para testar o build localmente antes do deploy
npm run preview
```

## ⚠️ **CHECKLIST FINAL**

- ✅ Build gerado sem erros
- ⬜ Upload da pasta `dist` no Netlify
- ⬜ Configurar redirects (/* → /index.html 200)
- ⬜ Testar sistema de usuários
- ⬜ Compartilhar URL com equipe
- ⬜ Orientar sobre criação de usuários únicos
- ⬜ Explicar sistema de backup

## 💡 **PRÓXIMOS PASSOS**

1. **Agora:** Faça o deploy conforme instruções acima
2. **Teste:** Crie 2 usuários diferentes para confirmar separação
3. **Compartilhe:** Envie URL para o time com instruções de uso
4. **Monitore:** Acompanhe se todos conseguem usar sem problemas

**Sua aplicação está 100% pronta para uso profissional!**