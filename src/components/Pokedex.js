import React, { useState, useEffect, useCallback } from 'react';
import './Pokedex.css';

// Mapeia os tipos para as imagens
const typeImages = {
  grass: "/images/types/Grass.png",
  poison: "/images/types/Poison.png",
  fire: "/images/types/Fire.png",
  water: "/images/types/Water.png",
  electric: "/images/types/Electric.png",
  bug: "/images/types/Bug.png",
  dark: "/images/types/Dark.png",
  dragon: "/images/types/Dragon.png",
  fairy: "/images/types/Fairy.png",
  fighting: "/images/types/Fight.png",
  flying: "/images/types/Flying.png",
  ghost: "/images/types/Ghost.png",
  ground: "/images/types/Ground.png",
  ice: "/images/types/Ice.png",
  normal: "/images/types/Normal.png",
  psychic: "/images/types/Psychc.png",
  rock: "/images/types/Rock.png",
  steel: "/images/types/Steel.png",
};

function Pokedex() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [allPokemonList, setAllPokemonList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const [targetPokemon, setTargetPokemon] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [pokemonDetail, setPokemonDetail] = useState(null);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then((res) => res.json())
      .then((data) => setAllPokemonList(data.results))
      .catch((err) => console.log(err));
  }, []);

  const fetchPokemons = useCallback(() => {
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`)
      .then((response) => response.json())
      .then((data) => {
        setPokemonList((prevList) => [...prevList, ...data.results]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [offset]);

  useEffect(() => {
    fetchPokemons();
  }, [fetchPokemons]);

  useEffect(() => {
    pokemonList.forEach((poke, idx) => {
      if (!poke.types) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${poke.name}`)
          .then((res) => res.json())
          .then((data) => {
            const updatedList = [...pokemonList];
            updatedList[idx] = {
              ...poke,
              types: data.types,
            };
            setPokemonList(updatedList);
          })
          .catch((err) => console.log(err));
      }
    });
  }, [pokemonList]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
      if (bottom && !loading) {
        setOffset((prev) => prev + 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  function handleSearchChange(e) {
    const value = e.target.value;
    setPokemonName(value);

    if (value.trim() !== '') {
      const filtered = allPokemonList.filter((p) =>
        p.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8)); // Limita o número de sugestões
    } else {
      setSuggestions([]);
    }
  }

  function handleSuggestionClick(name) {
    setPokemonName(name);
    setSuggestions([]);
    // Rolar até o Pokémon na lista + abrir modal
    scrollToPokemon(name);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (pokemonName.trim() !== '') {
      setSuggestions([]);
      const firstSuggestion = suggestions[0]; // Pega a primeira sugestão
      if (firstSuggestion) {
        scrollToPokemon(firstSuggestion.name); // Rola até o Pokémon sugerido
      }
    }
  }

  function scrollToPokemon(name) {
    const found = pokemonList.find((p) => p.name === name);
    if (found) {
      const element = document.getElementById(`pokemon-card-${name}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      openModal(name);
    } else {
      openModal(name);
    }
  }

  const tryOpenModal = useCallback((name) => {
    const element = document.getElementById(`pokemon-card-${name}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    openModal(name);
  }, []); // Dependência vazia, já que a função não depende de nenhum valor externo

  useEffect(() => {
    if (targetPokemon) {
      const found = pokemonList.find((p) => p.name === targetPokemon);
      if (found) {
        tryOpenModal(targetPokemon);
        setTargetPokemon(null);
      }
    }
  }, [pokemonList, targetPokemon, tryOpenModal]); // Essa função não depende de nada fora do escopo, então não precisa de dependências aqui
  

  function openModal(name) {
    setShowModal(true);
    setPokemonDetail(null);

    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((pokeData) => {
        fetch(pokeData.species.url)
          .then((res2) => res2.json())
          .then((speciesData) => {
            const flavorEntry = speciesData.flavor_text_entries.find(
              (entry) => entry.language.name === 'en'
            );
            const flavorText = flavorEntry ? flavorEntry.flavor_text.replace(/\f/g, ' ') : '';

            const detail = {
              id: pokeData.id,
              name: pokeData.name,
              sprite: pokeData.sprites.front_default,
              height: pokeData.height / 10,
              weight: pokeData.weight / 10,
              types: pokeData.types,
              description: flavorText,
            };
            setPokemonDetail(detail);
          })
          .catch((err2) => console.log(err2));
      })
      .catch((err) => console.log(err));
  }

  function closeModal() {
    setShowModal(false);
  }

  function handleOverlayClick(e) {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  }

  return (
    <div className="pokedex-container">
      <header className="pokedex-header">
        <h1>Pokedex</h1>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Type a Pokémon name"
            value={pokemonName}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <button type="submit" className="search-button">Search</button>

          {suggestions.length > 0 && (
            <div className="suggestion-list">
              {suggestions.map((pokeItem) => {
                const urlParts = pokeItem.url.split('/');
                const id = urlParts[urlParts.length - 2];
                return (
                  <div
                    key={pokeItem.name}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(pokeItem.name)}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                      alt={pokeItem.name}
                      className="suggestion-img"
                    />
                    <span>
                      {pokeItem.name.charAt(0).toUpperCase() + pokeItem.name.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </header>

      <div className="pokemon-grid">
        {pokemonList.map((p, index) => {
          const urlParts = p.url.split('/');
          const pokeId = urlParts[urlParts.length - 2];
          return (
            <div
              className="pokemon-card"
              key={index}
              id={`pokemon-card-${p.name}`}
              onClick={() => scrollToPokemon(p.name)}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`}
                alt={p.name}
                className="card-pokemon-img"
              />
              <div className="pokemon-info-overlay">
                <span>#{pokeId}</span>
                <h3>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</h3>
              </div>
              <div className="pokemon-types">
                {p.types &&
                  p.types.map((typeInfo, i) => (
                    <img
                      key={i}
                      src={typeImages[typeInfo.type.name]}
                      alt={typeInfo.type.name}
                      className="pokemon-type-img bigger-type-img"
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {showModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            {pokemonDetail ? (
              <>
                <div className="modal-header">
                  <h2>
                    #{pokemonDetail.id}{' '}
                    {pokemonDetail.name.charAt(0).toUpperCase() + pokemonDetail.name.slice(1)}
                  </h2>
                  <button className="close-button" onClick={closeModal}>X</button>
                </div>
                <div className="modal-body">
                  <img
                    src={pokemonDetail.sprite}
                    alt={pokemonDetail.name}
                    className="modal-pokemon-img"
                  />
                  <div className="attribute-box">
                    <div className="attribute-label">Type(s)</div>
                    <div className="attribute-value modal-types">
                      {pokemonDetail.types.map((typeObj, i) => (
                        <img
                          key={i}
                          src={typeImages[typeObj.type.name]}
                          alt={typeObj.type.name}
                          className="pokemon-type-img bigger-type-img"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="attribute-box">
                    <div className="attribute-label">Height</div>
                    <div className="attribute-value">{pokemonDetail.height} m</div>
                  </div>

                  <div className="attribute-box">
                    <div className="attribute-label">Weight</div>
                    <div className="attribute-value">{pokemonDetail.weight} kg</div>
                  </div>

                  <div className="attribute-box">
                    <div className="attribute-label">Description</div>
                    <div className="attribute-value">{pokemonDetail.description}</div>
                  </div>
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Pokedex;