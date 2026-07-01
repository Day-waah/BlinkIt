package com.blinkitclone.api.controller;

import com.blinkitclone.api.dto.AddressRequest;
import com.blinkitclone.api.entity.Address;
import com.blinkitclone.api.security.UserPrincipal;
import com.blinkitclone.api.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PostMapping
    public ResponseEntity<Address> addAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddressRequest request) {
        Address address = addressService.addAddress(userPrincipal.getId(), request);
        return new ResponseEntity<>(address, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Address> addresses = addressService.getAddressesByUserId(userPrincipal.getId());
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddressById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        Address address = addressService.getAddressById(id, userPrincipal.getId());
        return ResponseEntity.ok(address);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        Address address = addressService.updateAddress(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        addressService.deleteAddress(id, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
