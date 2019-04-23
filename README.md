# Ceicom Video Player
Video player para os projetos da Ceicom

### 1ª passo
Coloque o seguinte html onde você quer usar o player

```html
<div class="cvp-player-wrapper">
    <div id="cvp-player"></div>
    <div class="cvp-player">
        <button type="button" class="btn play-btn"></button>
        <div class="progress-bar-wrapper">
            <div class="progress-bar"></div>
        </div>
        <div class="volume-wrapper">
            <div class="volume-action-wrapper">
                <input type="range" name="points" min="0" max="10" value="10" orient="vertical"
                    class="volume-input">
            </div>
        </div>
        <div class="time">00:00 / 00:00</div>
        <div class="expand-button"></div>
    </div>
</div>
```

### 2ª passo
Coloque o css e js do plugin

```html
<link rel="stylesheet" href="caminho-para-o-arquivo/cvp.css">
<script src="caminho-para-o-arquivo/cvp.js"></script>
```

### 3ª passo
Execute o script

```js

// Player de Aúdio
new CeicomVideoPlayer(data);
```
**O player precisa receber um unico parâmetro de data para seu funcionamento**

### Extras:
Existe algumas funções no player

```js
// Player de Aúdio
const player = new CeicomVideoPlayer(data);

// pega o volume atual do player
player.getVolume();

// altera o volume atual do player
player.setVolume(0.5);
```