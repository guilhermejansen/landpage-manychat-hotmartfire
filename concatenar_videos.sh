#!/bin/bash

echo "🎬 INICIANDO CONCATENAÇÃO DE VÍDEOS COM VINHETAS..."
echo "=================================================="

# Criar pasta para vídeos concatenados
mkdir -p public/videos_concatenados

# Função para concatenar vídeo + vinheta
concatenar_video_vinheta() {
    local video_principal="$1"
    local vinheta="$2"
    local output="$3"

    echo "🔄 Concatenando $video_principal + $vinheta..."

    # Verificar se os arquivos existem
    if [ ! -f "$video_principal" ]; then
        echo "❌ Arquivo não encontrado: $video_principal"
        return 1
    fi

    if [ ! -f "$vinheta" ]; then
        echo "❌ Arquivo não encontrado: $vinheta"
        return 1
    fi

    # Criar arquivo de lista para FFmpeg
    echo "file '$video_principal'" > temp_list.txt
    echo "file '$vinheta'" >> temp_list.txt

    # Concatenar usando FFmpeg
    ffmpeg -f concat -safe 0 -i temp_list.txt -c copy "$output" -y

    # Verificar se funcionou
    if [ $? -eq 0 ]; then
        echo "✅ Sucesso: $output criado!"
        echo "📊 Tamanho: $(du -h "$output" | cut -f1)"
    else
        echo "❌ Erro ao concatenar $output"
    fi

    # Limpar arquivo temporário
    rm temp_list.txt
}

# Concatenar CONTANDO-ESTRELAS + VINHETA-2
concatenar_video_vinheta \
    "public/videos/CONTANDO-ESTRELAS.mp4" \
    "public/videos/VINHETA-2.mp4" \
    "public/videos_concatenados/CONTANDO-ESTRELAS-COM-VINHETA.mp4"

# Concatenar HISTORIA-1-MICHA + VINHETA-2
concatenar_video_vinheta \
    "public/videos/HISTORIA-1-MICHA.mp4" \
    "public/videos/VINHETA-2.mp4" \
    "public/videos_concatenados/HISTORIA-1-MICHA-COM-VINHETA.mp4"

# Concatenar HISTORIA-2-GALILEU + VINHETA-2
concatenar_video_vinheta \
    "public/videos/HISTORIA-2-GALILEU.mp4" \
    "public/videos/VINHETA-2.mp4" \
    "public/videos_concatenados/HISTORIA-2-GALILEU-COM-VINHETA.mp4"

# Concatenar HISTORIA-3-RAFA + VINHETA-2
concatenar_video_vinheta \
    "public/videos/HISTORIA-3-RAFA.mp4" \
    "public/videos/VINHETA-2.mp4" \
    "public/videos_concatenados/HISTORIA-3-RAFA-COM-VINHETA.mp4"

# Concatenar HISTORIA-4-LETICIA + VINHETA-2
concatenar_video_vinheta \
    "public/videos/HISTORIA-4-LETICIA.mp4" \
    "public/videos/VINHETA-2.mp4" \
    "public/videos_concatenados/HISTORIA-4-LETICIA-COM-VINHETA.mp4"

# Concatenar HISTORIA-5-GIOVANA + VINHETA-2
concatenar_video_vinheta \
    "public/videos/HISTORIA-5-GIOVANA.mp4" \
    "public/videos/VINHETA-2.mp4" \
    "public/videos_concatenados/HISTORIA-5-GIOVANA-COM-VINHETA.mp4"

echo ""
echo " CONCATENAÇÃO CONCLUÍDA!"
echo "📁 Vídeos concatenados em: public/videos_concatenados/"
echo ""
echo "📋 ARQUIVOS CRIADOS:"
echo "   • CONTANDO-ESTRELAS-COM-VINHETA.mp4"
echo "   • HISTORIA-1-MICHA-COM-VINHETA.mp4"
echo "   • HISTORIA-2-GALILEU-COM-VINHETA.mp4"
echo "   • HISTORIA-3-RAFA-COM-VINHETA.mp4"
echo "   • HISTORIA-4-LETICIA-COM-VINHETA.mp4"
echo "   • HISTORIA-5-GIOVANA-COM-VINHETA.mp4"
echo ""
echo "💡 Para usar, substitua os src dos vídeos no HTML por:"
echo "   • videos_concatenados/CONTANDO-ESTRELAS-COM-VINHETA.mp4"
echo "   • videos_concatenados/HISTORIA-1-MICHA-COM-VINHETA.mp4"
echo "   • videos_concatenados/HISTORIA-2-GALILEU-COM-VINHETA.mp4"
echo "   • videos_concatenados/HISTORIA-3-RAFA-COM-VINHETA.mp4"
echo "   • videos_concatenados/HISTORIA-4-LETICIA-COM-VINHETA.mp4"
echo "   • videos_concatenados/HISTORIA-5-GIOVANA-COM-VINHETA.mp4"
