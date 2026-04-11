package com.devsu.banking.application.service;

import com.devsu.banking.application.dto.ClientRequestDTO;
import com.devsu.banking.application.dto.ClientResponseDTO;
import com.devsu.banking.application.mapper.ClientMapper;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientService clientService;

    private ClientRequestDTO requestDTO;
    private Client client;
    private ClientResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = ClientRequestDTO.builder()
                .nombre("Jose Lema")
                .genero("Masculino")
                .edad(30)
                .identificacion("1234567890")
                .direccion("Otavalo sn y principal")
                .telefono("098254785")
                .contrasena("1234")
                .estado(true)
                .build();

        client = Client.builder()
                .nombre("Jose Lema")
                .genero("Masculino")
                .edad(30)
                .identificacion("1234567890")
                .direccion("Otavalo sn y principal")
                .telefono("098254785")
                .clienteId("ABC12345")
                .contrasena("$2a$10$encoded")
                .estado(true)
                .build();
        client.setId(1L);

        responseDTO = ClientResponseDTO.builder()
                .clienteId("ABC12345")
                .nombre("Jose Lema")
                .genero("Masculino")
                .edad(30)
                .identificacion("1234567890")
                .direccion("Otavalo sn y principal")
                .telefono("098254785")
                .estado(true)
                .build();
    }

    @Test
    @DisplayName("Should create a client successfully")
    void createClient_success() {
        when(clientMapper.toEntity(any(ClientRequestDTO.class))).thenReturn(client);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");
        when(clientRepository.save(any(Client.class))).thenReturn(client);
        when(clientMapper.toResponseDTO(any(Client.class))).thenReturn(responseDTO);

        ClientResponseDTO response = clientService.create(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.getNombre()).isEqualTo("Jose Lema");
        assertThat(response.getEstado()).isTrue();
        verify(clientRepository).save(any(Client.class));
        verify(passwordEncoder).encode("1234");
    }

    @Test
    @DisplayName("Should return all clients")
    void findAll_returnsList() {
        Pageable pageable = PageRequest.of(0, 20);
        when(clientRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(client)));
        when(clientMapper.toResponseDTO(any(Client.class))).thenReturn(responseDTO);

        Page<ClientResponseDTO> result = clientService.findAll(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getNombre()).isEqualTo("Jose Lema");
        verify(clientRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should return a client by clienteId")
    void findByClienteId_success() {
        when(clientRepository.findByClienteId("ABC12345")).thenReturn(Optional.of(client));
        when(clientMapper.toResponseDTO(any(Client.class))).thenReturn(responseDTO);

        ClientResponseDTO response = clientService.findByClienteId("ABC12345");

        assertThat(response).isNotNull();
        assertThat(response.getClienteId()).isEqualTo("ABC12345");
        assertThat(response.getNombre()).isEqualTo("Jose Lema");
    }

    @Test
    @DisplayName("Should throw exception when client does not exist")
    void findByClienteId_notFound_throwsException() {
        when(clientRepository.findByClienteId("NOTFOUND")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.findByClienteId("NOTFOUND"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Client");
    }

    @Test
    @DisplayName("Should delete a client successfully")
    void deleteClient_success() {
        when(clientRepository.findByClienteId("ABC12345")).thenReturn(Optional.of(client));
        doNothing().when(clientRepository).delete(client);

        clientService.delete("ABC12345");

        verify(clientRepository).delete(client);
    }

    @Test
    @DisplayName("Should update a client successfully")
    void updateClient_success() {
        when(clientRepository.findByClienteId("ABC12345")).thenReturn(Optional.of(client));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newencoded");
        when(clientRepository.save(any(Client.class))).thenReturn(client);
        when(clientMapper.toResponseDTO(any(Client.class))).thenReturn(responseDTO);
        doNothing().when(clientMapper).updateEntity(any(Client.class), any(ClientRequestDTO.class));

        ClientRequestDTO updateRequest = ClientRequestDTO.builder()
                .nombre("Jose Lema Updated")
                .genero("Masculino")
                .edad(31)
                .identificacion("1234567890")
                .direccion("New address")
                .telefono("098254785")
                .contrasena("5678")
                .estado(true)
                .build();

        ClientResponseDTO response = clientService.update("ABC12345", updateRequest);

        assertThat(response).isNotNull();
        verify(clientRepository).save(any(Client.class));
    }
}
