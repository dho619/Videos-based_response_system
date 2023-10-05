import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.prompt.deleteMany()
  await prisma.category.deleteMany()

  await prisma.category.create({
    data: {
      name: 'Reunião',
    }
  })

  await prisma.category.create({
    data: {
      name: 'Curso',
    }
  })

  await prisma.category.create({
    data: {
      name: 'Treinamento',
    }
  })

  await prisma.prompt.create({
    data: {
      title: 'Título Video',
      linkedVideoColumn: 'title',
      template: `Seu papel é gerar um título para um vídeo.

Abaixo você receberá uma transcrição desse vídeo, use essa transcrição para gerar o título.

O título devem ter no máximo 60 caracteres.
O título devem ser chamativo e atrativo.
O resultado não deve conter nada em volta, apenas o título limpo

Retorne APENAS o títulos como no exemplo abaixo, sem aspas em volta:
'''
Título 1
'''

Transcrição:
'''
{transcription}
'''`.trim()
    }
  })

  await prisma.prompt.create({
    data: {
      title: 'Descrição Video',
      linkedVideoColumn: 'description',
      template: `Seu papel é gerar uma descrição sucinta para um vídeo.
  
Abaixo você receberá uma transcrição desse vídeo, use essa transcrição para gerar a descrição.

A descrição deve possuir no máximo 80 palavras em primeira pessoa contendo os pontos principais do vídeo.

Use palavras chamativas e que cativam a atenção de quem está lendo.

Além disso, no final da descrição inclua uma lista de 3 até 10 hashtags em letra minúscula contendo palavras-chave do vídeo.

O retorno deve seguir o seguinte formato:
'''
Descrição.

#hashtag1 #hashtag2 #hashtag3 ...
'''

Transcrição:
'''
{transcription}
'''`.trim()
    }
  })

  await prisma.prompt.create({
    data: {
      title: 'Resumo',
      template: `Seu papel é gerar um pequeno resumo para a transcrição de um vídeo.
'''

Transcrição:
'''
{transcription}
'''`.trim()
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })