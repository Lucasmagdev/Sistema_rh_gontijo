#!/usr/bin/env python3
"""
Script para classificar linhas de ônibus de Belo Horizonte por tipo de serviço
baseado em padrões nos nomes e números das linhas.
"""

import csv
import json
import re
from pathlib import Path

# Padrões para classificação
PADROES = {
    'troncais_move': [
        r'^Estação\s+(Barreiro|Pampulha|Venda Nova|Vilarinho|São Gabriel|Diamante|Central|Lagoinha)',
        r'^[0-9]{1,2}$',  # Linhas com 1-2 dígitos (10-99)
        r'^30[0-9]$',  # Linhas 300-309
        r'^32[0-9]$',  # Linhas 320-329
        r'^33[0-9]$',  # Linhas 330-339
        r'^34[0-9]$',  # Linhas 340-349
        r'^50[0-9]$',  # Linhas 500-509
        r'^51[0-9]$',  # Linhas 510-519
        r'^52[0-9]$',  # Linhas 520-529
        r'^60[0-9]$',  # Linhas 600-609
        r'^61[0-9]$',  # Linhas 610-619
        r'^62[0-9]$',  # Linhas 620-629
        r'^63[0-9]$',  # Linhas 630-639
        r'^64[0-9]$',  # Linhas 640-649
        r'^70[0-9]$',  # Linhas 700-709
        r'^71[0-9]$',  # Linhas 710-719
        r'^72[0-9]$',  # Linhas 720-729
        r'^73[0-9]$',  # Linhas 730-739
        r'^74[0-9]$',  # Linhas 740-749
        r'^80[0-9]$',  # Linhas 800-809
        r'^81[0-9]$',  # Linhas 810-819
        r'^82[0-9]$',  # Linhas 820-829
        r'^83[0-9]$',  # Linhas 830-839
        r'^84[0-9]$',  # Linhas 840-849
        r'^85[0-9]$',  # Linhas 850-859
    ],
    'troncais_convencionais': [
        r'^Estação\s+(Barreiro|Pampulha|Venda Nova|Vilarinho|São Gabriel|Diamante|Central|Lagoinha)',
        r'Centro',
        r'Direta',
        r'Paradora',
    ],
    'estruturais': [
        r'^[1-9][0-9]{3}$',  # Linhas 1000-9999 (4 dígitos)
        r'^[2-9][0-9]{2}$',  # Linhas 200-999 (3 dígitos, exceto 100-199)
        r'^1[5-9][0-9]{2}$',  # Linhas 1500-1999
        r'^2[0-9]{3}$',  # Linhas 2000-2999
        r'^3[0-9]{3}$',  # Linhas 3000-3999
        r'^4[0-9]{3}$',  # Linhas 4000-4999
    ],
    'alimentadoras': [
        r'^[1-9][0-9]{3}[A-Z]$',  # Linhas com letra no final (ex: 1404A)
        r'^[4-9][0-9]{2}[A-Z]$',  # Linhas 400-999 com letra
        r'^[1-9][0-9]{2}[A-Z]$',  # Linhas 100-999 com letra
    ],
    'circular': [
        r'Circular',
        r'Madrugão.*Circular',
    ],
    'vilas_favelas': [
        r'Vila\s+',
        r'Favela',
        r'Conjunto\s+',
        r'Aglomerado',
    ],
    'metro': [
        r'Metro',
        r'Metrô',
        r'Estação.*Metro',
    ],
}

def classificar_linha(numero_linha: str, nome_linha: str) -> str:
    """
    Classifica uma linha baseado no número e nome.
    Retorna o tipo de serviço.
    """
    # Normalizar
    numero_linha = str(numero_linha).strip()
    nome_linha = str(nome_linha).strip()
    
    # Verificar cada tipo de serviço
    for tipo, padroes in PADROES.items():
        for padrao in padroes:
            # Verificar no número da linha
            if re.match(padrao, numero_linha, re.IGNORECASE):
                return tipo
            # Verificar no nome da linha
            if re.search(padrao, nome_linha, re.IGNORECASE):
                return tipo
    
    # Classificação padrão baseada no número
    num = numero_linha.replace('SC', '').replace('S', '').strip()
    
    if num.isdigit():
        num_int = int(num)
        if num_int < 100:
            return 'troncais_convencionais'
        elif num_int < 1000:
            return 'estruturais'
        elif num_int < 10000:
            return 'alimentadoras'
    
    # Se começar com SC (Serviço Complementar)
    if numero_linha.startswith('SC'):
        return 'estruturais'
    
    # Se começar com S (Serviço Especial)
    if numero_linha.startswith('S'):
        return 'estruturais'
    
    # Padrão desconhecido - assumir estrutural
    return 'estruturais'

def main():
    # Caminhos
    base_dir = Path(__file__).parent.parent
    csv_path = base_dir / 'GTFS' / 'GTFSBHTRANS' / 'linhas_origem_destino.csv'
    output_path = base_dir / 'GTFS' / 'GTFSBHTRANS' / 'linhas_classificadas.json'
    output_csv = base_dir / 'GTFS' / 'GTFSBHTRANS' / 'linhas_classificadas.csv'
    
    linhas_classificadas = []
    tipos_contagem = {}
    
    print(f"Lendo {csv_path}...")
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            linha = row['linha']
            nome = row['nome_linha']
            route_id = row['route_id']
            
            tipo = classificar_linha(linha, nome)
            
            linhas_classificadas.append({
                'linha': linha,
                'nome_linha': nome,
                'route_id': route_id,
                'tipo_servico': tipo,
                'direction_id': row.get('direction_id', '0'),
            })
            
            tipos_contagem[tipo] = tipos_contagem.get(tipo, 0) + 1
    
    # Salvar JSON
    print(f"Salvando {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total_linhas': len(linhas_classificadas),
            'classificacao': tipos_contagem,
            'linhas': linhas_classificadas
        }, f, ensure_ascii=False, indent=2)
    
    # Salvar CSV
    print(f"Salvando {output_csv}...")
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['linha', 'nome_linha', 'route_id', 'tipo_servico', 'direction_id'])
        writer.writeheader()
        writer.writerows(linhas_classificadas)
    
    print("\n[OK] Classificacao concluida!")
    print(f"Total de linhas: {len(linhas_classificadas)}")
    print("\nDistribuição por tipo:")
    for tipo, count in sorted(tipos_contagem.items(), key=lambda x: -x[1]):
        print(f"  {tipo}: {count}")

if __name__ == '__main__':
    main()

